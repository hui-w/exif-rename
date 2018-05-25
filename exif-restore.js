const fs = require('fs');
const path = require('path');
const FolderTraversal = require('./folder_traversal');
const { isExifFileName, getNameByExif } = require('./utils/exif')

const fileProcessor = (folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    // Restore file name
    if (isExifFileName(fileName)) {
      const pathName = path.join(folderPath, fileName);
      const newPathName = path.join(folderPath, fileName.substring(15));
      fs.rename(pathName, newPathName, () => {
        resolve({ folderPath, fileName, msg: 'Restored' })
      });
    }
  })
}

// To rename photos with exif date time
try {
  const filePath = process.argv.length === 3 ? process.argv[2] : __dirname;
  new FolderTraversal(filePath, fileProcessor);
} catch (error) {
  console.log('Main Error: ' + error.message);
}