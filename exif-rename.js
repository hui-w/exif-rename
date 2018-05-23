const FolderTraversal = require('./folder_traversal');
const ExifImage = require('./lib/exif').ExifImage;
const fs = require('fs');
const path = require('path');

const isExifFileName = (fileName) => {
  var re = /[0-9]{14}_.*/g;
  return re.test(fileName);
}

const getNameByExif = (folderPath, fileName) => {
  if (isExifFileName(fileName)) {
    return Promise.reject({ message: 'The EXIF time is already in the file name.' });
  }

  const pathName = path.join(folderPath, fileName);

  if (!/\.(jpg|jpeg|JPG|JPEG)$/.test(pathName)) {
    return Promise.reject({ message: 'The file is not an image.' });

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

      reject({ message: 'No time found in the Exif.' });
    });
  });
}

const fileProcessor = (folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    // Rename file
    getNameByExif(folderPath, fileName).then(
      newName => {
        const pathName = path.join(folderPath, fileName);
        const newPathName = path.join(folderPath, newName);
        fs.rename(pathName, newPathName, () => {
          resolve({folderPath, fileName, msg: 'Renamed'});
        });
      },
      info => {
        reject({folderPath, fileName, msg: info.message});
      }).catch(
      ex => {
        reject({folderPath, fileName, msg: ex.message});
      });
  })
}

// To rename photos with exif date time
try {
  const filePath = process.argv.length === 3 ? process.argv[2] : __dirname;
  new FolderTraversal(filePath, fileProcessor);
} catch (error) {
  console.log('Main Error: ' + error.message);
}