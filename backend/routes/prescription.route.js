const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: imageStorage });

router.post('/new_prescription', upload.single('image'), async (req, res) => {
    var filename = req.file.filename;
    // Send filename as response
    res.json({ filename: filename });
});

module.exports = router;
