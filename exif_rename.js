// To rename photos with exif date time

const fs = require('fs');
const path = require('path');
const ExifImage = require('./lib/exif').ExifImage;

// Get all files and directories from the folder
const readFolder = folderPath =>
  new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

// Get the type of a file or directory
const statFile = pathName =>
  new Promise((resolve, reject) => {
    fs.stat(pathName, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });

// Process the file
const processFile = pathName =>
  new Promise((resolve, reject) => {
    statFile(pathName).then(stats => {
      if (stats.isFile()) {
        getNameByExif(pathName, stats.ctime);
      } else if (stats.isDirectory()) {
        processFolder(pathName);
      }
    }).catch(err => {
      throw err;
    })
  });

// Process the folder
const processFolder = (folderPath) => {
  readFolder(folderPath).then(fileNames => {
      fileNames.forEach((fileName, index) => {
        const pathName = path.join(folderPath, fileName);
        statFile(pathName)
          .then(stats => {
            if (stats.isFile()) {
              processFile(pathName);
            } else if (stats.isDirectory()) {
              processFolder(pathName);
            }
          })
      });
    })
    .catch(err => {
      throw err;
    });
};

// Process the file
const getNameByExif = (filePathName, fileCreateTime) => {
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
};

// Copy file
const copy = (src, dst) => {
  fs.writeFileSync(dst, fs.readFileSync(src));
}

// For big file
const copyWithPipe = (src, dst) => {
  fs.createReadStream(src).pipe(fs.createWriteStream(dst));
}

// Main entry
try {
  const filePath = process.argv.length === 3 ? process.argv[2] : __dirname;
  processFolder(filePath);
} catch (error) {
  console.log('Main Error: ' + error.message);
}