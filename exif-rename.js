const fs = require('fs');
const path = require('path');
const FolderTraversal = require('./folder_traversal');
const { isExifFileName, getNameByExif } = require('./utils/exif')

const fileProcessor = (folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    getNameByExif(folderPath, fileName).then(
      info => {
        const pathName = path.join(folderPath, fileName);
        const newName = info.message;
        const newPathName = path.join(folderPath, newName);
        fs.rename(pathName, newPathName, () => {
          resolve({ ...info, message: `Renamed to ${newName}` });
        });
      }).catch(
      ex => {
        // reject(ex);
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