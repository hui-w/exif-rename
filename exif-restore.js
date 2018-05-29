const fs = require('fs');
const path = require('path');
const FolderTraversal = require('./folder_traversal');
const { isExifFileName, getNameByExif } = require('./utils/exif')

const fileProcessor = (folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    // Restore file name
    if (isExifFileName(fileName)) {
      const pathName = path.join(folderPath, fileName);
      const newName = fileName.substring(15);
      const newPathName = path.join(folderPath, newName);
      fs.rename(pathName, newPathName, () => {
        resolve({ folderPath, fileName, message: `Restored to ${newName}` })
      });
    } else {
      // reject({ folderPath, fileName, message: `No need to restore` });
    }
  })
}

// To restore file names renamed with EXIF
try {
  const filePath = process.argv.length === 3 ? process.argv[2] : __dirname;
  new FolderTraversal(filePath, fileProcessor);
} catch (error) {
  console.log('Main Error: ' + error.message);
}