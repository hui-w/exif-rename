'use strict';
const fs = require('fs');
const path = require('path');
const ExifImage = require('./lib/exif').ExifImage;

class ExifRename {
  constructor(pathName) {
    this.processFolder(pathName);
  }

  // Get all files and directories from the folder
  readFolder(folderPath) {
    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  // Get the type of a file or directory
  statFile(pathName) {
    return new Promise((resolve, reject) => {
      fs.stat(pathName, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats);
        }
      });
    });
  }

  // Process the folder
  processFolder(folderPath) {
    return this.readFolder(folderPath).then(fileNames => {
        fileNames.forEach((fileName, index) => {
          const pathName = path.join(folderPath, fileName);
          this.statFile(pathName)
            .then(stats => {
              if (stats.isFile()) {
                this.processFile(folderPath, fileName);
              } else if (stats.isDirectory()) {
                this.processFolder(pathName);
              }
            })
        });
      })
      .catch(err => {
        throw err;
      });
  }

  // Process the file
  processFile(folderPath, fileName) {
    return new Promise((resolve, reject) => {
      const pathName = path.join(folderPath, fileName);
      this.statFile(pathName).then(stats => {
        if (stats.isFile()) {
          this.getNameByExif(folderPath, fileName, stats.ctime).then(newName => {
            const newPathName = path.join(folderPath, newName);
            // fs.rename(pathName, newPathName).then(info => console.log(info));
          }).catch(ex => {
            // console.log(`${pathName}: ${ex.message}`)
          });
        } else if (stats.isDirectory()) {
          this.processFolder(pathName);
        }
      }).catch(err => {
        throw err;
      })
    });
  }

  getNameByExif(folderPath, fileName, fileCreateTime) {
    const isExifFileName = (fileName) => {
      var re = /[0-9]{14}_.*/g;
      return re.test(fileName);
    }

    console.log(isExifFileName('2012050112154_C501_8504.jpg'));
    console.log(isExifFileName('20120501112154_C501_8504.jpg'));

    const pathName = path.join(folderPath, fileName);

    if (!/\.(jpg|jpeg|JPG|JPEG)$/.test(pathName)) {
      return Promise.reject({ message: 'Not an Image' });

    }

    return new Promise((resolve, reject) => {
      new ExifImage({ image: pathName }, function(error, exifData) {
        if (error) {
          reject(error);
          // console.log('Error: ' + error.message);
        }

        // fs.writeFile(path.resolve('info.json'), JSON.stringify(exifData));
        const dateTime = exifData && exifData.exif && exifData.exif.DateTimeOriginal;
        if (dateTime) {
          const newFileName = dateTime.split(':').join('').split(' ').join('') + '_' + fileName;
          resolve(newFileName);
          // copy(pathName, path.resolve(dest_path, newFileName));
        }

        reject({ message: 'No Time in Exif' });
      });
    });
  }

  // Copy file
  copy(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
  }

  // For big file
  copyWithPipe(src, dst) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dst));
  }
}

module.exports = ExifRename;