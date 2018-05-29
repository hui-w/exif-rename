const path = require('path');
const FolderTraversal = require('./folder_traversal');
const { isExifFileName, getNameByExif } = require('./utils/exif')

const fileProcessor = (folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    // Rename file
    getNameByExif(folderPath, fileName).then(
      info => {
        const pathName = path.join(folderPath, fileName);
        resolve({ ...info, message: `Will rename to ${info.message}` });
      }).catch(
      ex => {
        // reject(ex);
      });
  })
}

// To preview names with exif date time
try {
  const filePath = process.argv.length === 3 ? process.argv[2] : __dirname;
  new FolderTraversal(filePath, fileProcessor);
} catch (error) {
  console.log('Main Error: ' + error.message);
}