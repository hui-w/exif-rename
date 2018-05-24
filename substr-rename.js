const FolderTraversal = require('./folder_traversal');
const fs = require('fs');
const path = require('path');

const fileProcessor = (folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    const pathName = path.join(folderPath, fileName);
    const newName = fileName.substring(45);
    const newPathName = path.join(folderPath, newName);
    fs.rename(pathName, newPathName, () => {
      resolve({ folderPath, fileName, msg: newName })
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