const express = require('express');
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');
const uploadFile = require('../util/multerUpload');
const router = express.Router();

function deleteFile(convertedFilename, message) {
    fs.unlink(
        path.join(__dirname, `../images/${convertedFilename}`),
        () => {
            if (typeof message == 'undefined') {
                console.log(`ERROR OCCURED - deleting ${convertedFilename}`)
            } else {
                console.log(message);
            }
        }
    );
}

router.post('/convert-heic', async function (req, res) {
    try {
        // use multer to upload the desired image
        await uploadFile(req, res);
        if (req.file === undefined) return res.status(400).json({ success: false, message: "No file uploaded" });

        // store the filename from multer
        const filename = req.body.filename;
        const quality = req.body.quality;
        const filetype = req.body.filetype;
        console.log(filename, quality, filetype);

        // convert the file, worker_threads
        const worker = new Worker(path.join(__dirname, '../util/workers/heicConvertWorker.js'),
            {
                workerData: {
                    filename: filename,
                    quality: quality,
                    format: filetype
                }
            }
        );

        worker.on("message", data => {
            let { success, convertedFilename } = data;
            console.log("DATA: " + JSON.stringify(data));
            if (success) {
                return res.download(
                    path.join(__dirname, `../images/${convertedFilename}`),
                    { dotfiles: "deny" },
                    function (err) {
                        if (err) console.error(err);
                        deleteFile(convertedFilename, `Download initiated, deleting ${convertedFilename}`);
                    }
                );
            } else {
                deleteFile(convertedFilename);
                return res.status(415).json({ success: false, message: `Error processing image. Input buffer is not a HEIC image` });
            }
        });

        worker.on("error", err => {
            // console.error(err);
            // res.send(500).json({ success: false, message: err.message });
            throw err;
        });
        
        worker.on("exit", code => console.log("worker exited with code " + code));

    } catch (error) {
        console.error("error", error.message);
        let message = "Error processing image. ";
        let code = 500;
        if (error.message.includes("not an HEIC file")) {
            message += error.message;
            code = 415;
        } else if (error.message.includes("Input buffer is not a HEIC image")) {
            message += error.message;
            code = 415
        } else {
            message = error.message;
        }
        
        return res.status(code).json({
            success: false, message: message
        });
    }
});

module.exports = router;