'use strict';
const fs = require('fs');
const path = require('path');

const getFridnelyInfo = (startPath, folderPath, fileName, msg) => {
  const filePathName = path.resolve(folderPath, fileName);
  const fileInfo = filePathName.substring(startPath.length);

  return `FILE: ${fileInfo}\nINFO: ${msg}\n`;
}

class FolderTraversal {
  constructor(pathName, fileProcessor) {
    this.startPath = pathName;
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
          this.fileProcessor(folderPath, fileName)
            .then(
              ({ folderPath, fileName, msg }) => console.log(getFridnelyInfo(this.startPath, folderPath, fileName, msg))
            )
            .catch(
              ({ folderPath, fileName, msg }) => console.log(getFridnelyInfo(this.startPath, folderPath, fileName, msg))
            );
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