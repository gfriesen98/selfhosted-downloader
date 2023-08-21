const fs = require('fs').promises;
const convert = require('heic-convert');
const { parentPort, workerData } = require('worker_threads');

const { filename, quality, format } = workerData;
async function convertImg() {
    try {
        // input the uploaded file
        console.log('start conversion');
        const inputBuffer = await fs.readFile(`./images/${filename}`);
        const outputBuffer = await convert({
            buffer: inputBuffer,
            quality: quality,
            format: format
        });

        // create the new converted file
        let newFilename = filename.replace(".heic", ".jpg");
        await fs.writeFile(`./images/${newFilename}`, outputBuffer);
        console.log(`wrote ./images/${newFilename}`);
        
        // delete the old .heic file asap
        await fs.unlink(`./images/${filename}`);
        console.log(`deleted ./images/${filename}`);

        parentPort.postMessage({success: true, convertedFilename: newFilename});
    } catch (error) {
        console.error(error);
        parentPort.postMessage({ success: false, convertedFilename: filename });
    }
}

convertImg()