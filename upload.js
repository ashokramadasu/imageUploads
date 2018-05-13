'use strict' 

const  fs = require('fs'),
       multer = require('multer'),
       path = require('path'),
       gm = require('gm').subClass({imageMagick: true});

// Set The Storage folder for Multer
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,path.parse(file.originalname).name + '-' + Date.now() + path.parse(file.originalname).ext);
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024  // 2 MB is Upper Limit
  },
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type Function
function checkFileType(file, cb){
  // Allowed Image Formats
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extention
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mimeType
  const mimetype = filetypes.test(file.mimetype);
  // Some cases User change extention and upload Hence mimetype and extention both are nex
  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
};       

function uploadAPIhandler(req, res, next) {
  upload(req, res, (err) => { 
    if(err){
      return next(err + ' Please select below 2MB image');
    } else {
      if(req.file == undefined){
        const error  = new Error('No File Selected!');
        return next(error);
      } else {
        console.log('Uploaded File Parameters :: ' + JSON.stringify(req.file, null, 2));
        let filePath =req.file.path;
        let uploadedFileSize = (req.file.size)/1024;  // In KB 
        // below  function for obtain the size of an image
        gm(filePath)
        .size((err, size) => {
          if (err) return next(err);
          console.log('Resolution of Uploaded Image :: ' + JSON.stringify(size));
          let resize = { width: size.width/2 };
          resize.height = size.height/2;
          let resizeFilePath = './public/compressed/resize-' + req.file.filename;
          // below  function for obtain the compressed image
          gm(filePath)
          .resizeExact(resize.width, resize.height)
          .write(resizeFilePath, (err) => {
            if (err) return next(err);
            console.log('Resolution of compressed Image :: ' + JSON.stringify(resize));
            let base64Image = new Buffer(fs.readFileSync(resizeFilePath), 'binary').toString('base64');

            fs.readFile(resizeFilePath, (err, data) =>{
              let compressedFileSize = (Buffer(data).length)/ 1024; // In KB
              if (compressedFileSize > 500 ) { // 500 KB
                const error  = new Error('compressed Image exceeded 500KB. Please choose low resolution Image!');
                return next(error);
              }
              console.log('uploaded image size in Bytes ::' + uploadedFileSize+ 
                          ' and compressed file Size in Bytes ::' + compressedFileSize);
              // // Final API response sending to Client --status Working
              res.json({
                msg: 'File Uploaded Successfully!',
                uploadedFileSizeInKB: uploadedFileSize,
                compressedFileSizeInKB: compressedFileSize,
                uploadedFileResolution: size,
                compressedFileResolution: resize,
                base64String: base64Image
              });
              // // Needs to Implement further on Client Side -- status Pending
              // res.render('index', {
              //   msg: 'File Uploaded Successfully!',
              //   base64String: base64Image,
              //   file: resizeFilePath
              // });
            });
          });
        });
      }
    }
  });
};


module.exports = { uploadAPIhandler : uploadAPIhandler };