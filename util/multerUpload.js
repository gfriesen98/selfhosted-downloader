const multer = require('multer');
const util = require('util');
const path = require('path');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../images'));
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        req.body.filename = fileName
        cb(null, fileName);
    }
});

const multerFilter = (req, file, cb) => {
    if (!file.originalname.endsWith('.heic')) {
        cb(new Error(`${file.originalname} is not an HEIC file.`), false);
    } else {
        cb(null, true);
    }
}

let uploadFile = multer({
    storage: multerStorage,
    fileFilter: multerFilter
}).single("file");


let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;