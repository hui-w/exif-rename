const ExifRename = require('./exif_rename');

// To rename photos with exif date time
try {
  const filePath = process.argv.length === 3 ? process.argv[2] : __dirname;
  new ExifRename(filePath);
} catch (error) {
  console.log('Main Error: ' + error.message);
}