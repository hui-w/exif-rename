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

  // Process the file
  processFile(pathName) {
    return new Promise((resolve, reject) => {
      this.statFile(pathName).then(stats => {
        if (stats.isFile()) {
          this.getNameByExif(pathName, stats.ctime);
        } else if (stats.isDirectory()) {
          this.processFolder(pathName);
        }
      }).catch(err => {
        throw err;
      })
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
                this.processFile(pathName);
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

  getNameByExif(filePathName, fileCreateTime) {
    if (!/\.(jpg|jpeg|JPG|JPEG)$/.test(filePathName)) {
      return;
    }

    try {
      new ExifImage({ image: filePathName }, function(error, exifData) {
        if (error) {
          // console.log('Error: ' + error.message);
        } else {
          // fs.writeFile(path.resolve('info.json'), JSON.stringify(exifData));
          const dateTime = exifData.exif.DateTimeOriginal;
          if (dateTime) {
            const newFileName = dateTime.split(':').join('').split(' ').join('') + '.jpg';
            // const newFileName = dateTime.split(':').join('-').replace(' ', '_') + '.jpg';
            // copy(filePathName, path.resolve(dest_path, newFileName));
            console.log(newFileName);
          } else {
            console.log(fileCreateTime);
          }
        }
      });
    } catch (error) {
      throw error;
    }
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