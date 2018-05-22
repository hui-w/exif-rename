'use strict';
const fs = require('fs');
const path = require('path');

const getFriendlyError = (folderPath, fileName, errorMsg) => {
  let fileInfo;

  if (folderPath === __dirname) {
    fileInfo = fileName;
  } else {
    const friendlyFlderName = folderPath.substring(__dirname.length + 1);
    fileInfo = `${friendlyFlderName}/${fileName}`;
  }

  return `FILE: ${fileInfo}\nINFO: ${errorMsg}\n`;
}

class FolderTraversal {
  constructor(pathName, fileProcessor) {
    this.fileProcessor = fileProcessor;
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
          this.fileProcessor(folderPath, fileName);
        } else if (stats.isDirectory()) {
          this.processFolder(pathName);
        }
      }).catch(err => {
        throw err;
      })
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

module.exports = FolderTraversal;