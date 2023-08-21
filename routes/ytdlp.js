const express = require('express');
const fs = require('fs/promises');
const ffs = require('fs');
const AdmZip = require('adm-zip');
const {
    downloadAudio,
    downloadVideo,
    getTitle,
    getPlaylistJson
} = require('../util/ytdlp');
const { id3MetadataObject } = require('../util/utility');
const NodeID3 = require('node-id3');
const router = express.Router();

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR;

/**
 * Use yt-dlp to get title info for a youtube video
 */
router.get('/yt/titles', async function (req, res) {
    try {
        if (req.query.url === undefined) return res.status(400).json({ success: false, message: 'no urls' });
        console.log('Grabbing title for ' + req.query.url);
        
        let title = await getTitle(req.query.url);
        console.log(title);

        return res.status(200).json({ success: true, message: "downloaded", title: title });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "failed" });
    }
});

/**
 * Use yt-dlp to download and convert a video to audio
 * Includes metadata in the end result
 */
router.post('/yt/download/audio', async function (req, res) {
    try {
        if (req.body.urlObject === undefined) return res.status(400).json({ success: false, message: 'no url data' });
        let id = req.cookies.id;
        let downloadDir = `${DOWNLOAD_DIR}/${id}`;

        try {
            await fs.access(downloadDir);
        } catch (error) {
            await fs.mkdir(downloadDir);
        }

        let urlObject = req.body.urlObject;
        console.log("starting download for " + urlObject.input.value);

        let success = await downloadAudio(urlObject.input.value, downloadDir, urlObject.metadata.title.value);
        if (success) {
            // write metadata to file
            let id3MetadataObj = id3MetadataObject(urlObject.metadata);
            let id3path = `${DOWNLOAD_DIR}/${id}/${urlObject.metadata.title.value}.mp3`;
            await NodeID3.Promise.update(id3MetadataObj, id3path);
            return res.status(200).json({ success: true, message: "Success", urlObject });
        } else {
            return res.status(500).json({ success: false, message: "Failed to download", urlObject });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Use yt-dlp to download a video
 */
router.post('/yt/download/video', async function (req, res) {
    try {
        if (req.body.urlObject === undefined) return res.status(400).json({ success: false, message: 'no url data' });
        let downloadDir = `${DOWNLOAD_DIR}/${req.cookies.id}`;

        try {
            await fs.access(downloadDir);
        } catch (error) {
            await fs.mkdir(downloadDir);
        }

        let urlObject = req.body.urlObject;
        console.log("starting download for " + urlObject.input.value);
        let success = await downloadVideo(urlObject.input.value, downloadDir, urlObject.metadata.title.value);
        if (success) return res.status(200).json({ success: true, message: "Success" });
        else return res.status(500).json({ success: false, message: "Failed to download" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Prepare a zipfile for download
 */
router.get('/yt/download/prepare-zip', async function (req, res) {
    try {
        let id = req.cookies.id;
        const zip = new AdmZip();
        const outputFile = `${DOWNLOAD_DIR}/${id}.zip`;
        console.log(`Adding contents of ${id} to zip`);
        await zip.addLocalFolderPromise(`${DOWNLOAD_DIR}/${id}`);

        console.log('Writing zip...');
        await zip.writeZipPromise(outputFile);

        console.log('Done');
        return res.status(200).json({ success: true, filename: `${id}.zip` });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, filename: "" });
    }
});

router.get('/yt/playlist/data', async function (req, res) {
    if (req.query.playlistUrl === undefined) return res.status(400).json({ success: false, message: 'no playlist url' });
    try {
        const playlistUrl = req.query.playlistUrl;
        let playlistData = await getPlaylistJson(playlistUrl);
        console.log(playlistData);
        return res.status(200).json({ success: true, playlistData: playlistData });
    } catch (error) {
        console.error("Error",error);
        return res.status(500).json({ success: false, message: 'failed to get playlist data'});
    }
});

/**
 * Send zipfile to the browser
 */
router.get('/yt/download/serve-zip', async function (req, res) {
    try {
        let id = req.cookies.id;
        let file = `${DOWNLOAD_DIR}/${id}.zip`;
        console.log('Sendinig zip to browser');

        try {
            await fs.access(file);
        } catch (error) {
            console.log(`${file} does not exist.`);
            return res.status(500).json({ success: false, message: 'zipfile does not exist' });
        }
        
        let name = file.replace('./', '');
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${name}`);
        const stream = ffs.createReadStream(file);
        stream.pipe(res);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

router.delete('/yt/delete', async function (req, res) {
    try {
        let id = req.cookies.id;
        await fs.rm(`${DOWNLOAD_DIR}/${id}`, { recursive: true });
        await fs.rm(`${DOWNLOAD_DIR}/${id}.zip`);
        return res.sendStatus(200);
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
})

module.exports = router;


// old, might still be useful
        // res.setHeader('Content-Length', stat.size);
        // stream.pipe(res);


        // return res.download(file, async (error) => {
        //     if (error) {
        //         console.error("ERROR: Error on res.download(): ");
        //         console.error(error);
        //         if (res.headersSent) {
        //             console.error("ERROR: Headers were partially sent");
        //             console.error("ERROR: ", res);
        //             return res.end().sendStatus(500);
        //         } else {
        //             return res.sendStatus(500);
        //         }
        //     } else {
        //         // console.log('Removing temporary files');
        //         // await fs.rm(`${DOWNLOAD_DIR}/${id}`, { recursive: true });
        //         // await fs.unlink(file);
        //     }
        // });