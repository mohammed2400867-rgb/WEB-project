const multer = require('multer');
const path = require('path');

// Save files to public/uploads/ with a unique name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
        cb(null, uniqueName);
    }
});

// Only allow image files
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const isValid = allowed.test(path.extname(file.originalname).toLowerCase())
                 && allowed.test(file.mimetype);
    if (isValid) cb(null, true);
    else cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

module.exports = upload;
