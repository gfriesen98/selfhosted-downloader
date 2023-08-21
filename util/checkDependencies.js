const { access, mkdir, unlink, writeFile } = require('fs/promises');
const { createWriteStream } = require('fs');
const { default: Axios } = require('axios');
const ytdlp_ver = require('../ytdlp_ver.json');
const { getVersion } = require('./ytdlp');
const YTDLP_SRC_URL = process.env.YTDLP_SRC_URL;
const YTDLP_RELEASES_URL = process.env.YTDLP_RELEASES_URL;
const YTDLP_BINARY = process.env.YTDLP_BINARY;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR;

/**
 * Check for binaries folder, creates it if not
 */
async function checkBinariesFolder() {
    try {
        await access('./binaries');
        console.log('./binaries exists');
    } catch (error) {
        console.log('./binaries does not exist');
        try {
            await mkdir('./binaries');
            console.log('./binaries created');
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
}

async function checkDownloadsFolder() {
    try {
        await access(DOWNLOAD_DIR);
        console.log(`${DOWNLOAD_DIR} exists`);
    } catch (error) {
        try {
            await mkdir(DOWNLOAD_DIR);
            console.log(`Created ${DOWNLOAD_DIR}`);
        } catch (error) {
            console.error(error);
            console.error(`ERROR: Failed to create ${DOWNLOAD_DIR}`);
            process.exit(1);
        }
    }
}

/**
 * Check for ytdlp binary
 */
async function checkBinariesExist() {
    try {
        await access(`./binaries/${YTDLP_BINARY}`);
        console.log(`${YTDLP_BINARY} exists`);
        return true;
    } catch (error) {
        console.log(`${YTDLP_BINARY} does not exist`);
        return false;
    }
}

/**
 * Check the latest ytdlp version from github
 */
async function checkYtdlpVersion() {
    try {
        console.log('Checking ytdlp github releases...');
        let res = await Axios.get(YTDLP_RELEASES_URL);
        let gh_latest_ver = res.data[0].tag_name;
        return gh_latest_ver;
    } catch (error) {
        console.error(error);
        return error;
    }
}

/**
 * Download ytdlp binary
 * @param {String} url 
 */
async function downloadYtdlp(url) {
    try {
        console.log("Downloading " + YTDLP_BINARY + "\nURL: " + url);
        const res = await Axios.get(url, { responseType: 'stream' });
        const dest = createWriteStream('./binaries/' + YTDLP_BINARY);
        await res.data.pipe(dest);
    } catch (error) {
        console.error(error);
        console.error(`Failed to download ${YTDLP_BINARY}`);
        process.exit(1);
    }
}

/**
 * Check for required dependencies for the app
 */
module.exports = async function checkDependencies(skip) {
    if (skip) return null;
    
    await checkBinariesFolder();
    await checkDownloadsFolder();
    let gh_latest_ver = await checkYtdlpVersion();
    let releaseUrl = `${YTDLP_SRC_URL}/${gh_latest_ver}/${YTDLP_BINARY}`;

    let binariesExist = await checkBinariesExist();
    if (binariesExist) {
        // check for update
        let current = ytdlp_ver.version;
        if (current === gh_latest_ver) {
            console.log('yt-dlp is current: ' + current);
        } else {
            console.log('yt-dlp is out of date. Using ' + current + ' but new version is ' + gh_latest_ver);
            await unlink('./binaries/' + YTDLP_BINARY);
            console.log('Downloading new yt-dlp version');
            await downloadYtdlp(url);
        }
    } else {
        // get ytdlp
        await downloadYtdlp(releaseUrl);
        await writeFile('./ytdlp_ver.json', JSON.stringify({ version: gh_latest_ver }));
    }

    // test ytdlp
    console.log('Running test spawn:');
    let version = await getVersion();
    console.log(`spawn(./binaries/${YTDLP_BINARY}, [--version]) : ${version}`);
    console.log('===================================\n');
}