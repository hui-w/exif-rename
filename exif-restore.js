const FolderTraversal = require('./folder_traversal');
const fs = require('fs');
const path = require('path');

const isExifFileName = (fileName) => {
  var re = /[0-9]{14}_.*/g;
  return re.test(fileName);
}

const fileProcessor = (folderPath, fileName) => {
  // Restore file name
  if (isExifFileName(fileName)) {
    const pathName = path.join(folderPath, fileName);
    const newPathName = path.join(folderPath, fileName.substring(15));
    fs.rename(pathName, newPathName, () => {});
  }
}

// To rename photos with exif date time
try {
  const filePath = process.argv.length === 3 ? process.argv[2] : __dirname;
  new FolderTraversal(filePath, fileProcessor);
} catch (error) {
  console.log('Main Error: ' + error.message);
}