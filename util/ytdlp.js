const { spawn } = require('child_process');
const YTDLP_BINARY = process.env.YTDLP_BINARY;

/**
 * Gets the current version
 * @returns {Promise<String>} Resoves with the output of --version
 */
function getVersion() {
    let Version = new Promise(function (resolve, reject) {
        const ytdlp = spawn('./binaries/' + YTDLP_BINARY, ['--version']);
        let output = "";
        ytdlp.stdout.on('data', data => {
            output = data.toString().trim();
        });

        ytdlp.on('error', error => {
            console.error(error);
            reject(error.message);
        });

        ytdlp.stderr.on('data', data => {
            console.error(data.toString().trim());
        });

        ytdlp.on('exit', code => {
            if (code > 0) {
                reject('Proccess failed with exit code ' + code);
            } else {
                resolve(output);
            }
        });
    });

    return Version;
}

/**
 * Uses yt-dlp to get the video output title
 * @param {String} url youtube url
 * @returns {Promise}
 */
function getTitle(url, opts) {
    if (opts == undefined) {
        opts = [
            '--ignore-errors',
            "--print", "filename",
            "-o", "%(title)s",
            url
        ];
    }
    let Title = new Promise((resolve, reject) => {
        const ytdlp = spawn('./binaries/' + YTDLP_BINARY, opts);
        let returnValue = "";
        ytdlp.stdout.on('data', data => {
            let output = data.toString().trim();
            if (output.startsWith(`${YTDLP_BINARY}: error:`)) reject(output);
            returnValue = output;
        });

        ytdlp.on('error', error => {
            reject(error.message);
        });

        ytdlp.stderr.on('data', data => {
            reject(data.toString().trim());
        });

        ytdlp.on('exit', code => {
            if (code > 0) {
                reject('Proccess failed with exit code ' + code);
            } else {
                resolve(returnValue);
            }
        });
    });

    return Title;
}

/**
 * Use yt=dlp to downnload audio from a youtube url
 * @param {String} url youtube url
 * @param {String} destination download destination
 * @param {String} filename desired filename
 * @param {Object} options array of yt-dlp options
 * @returns {Promise}
 */
function downloadAudio(url, destination, filename, options = {format: "bestaudio", audioformat: "mp3"}) {
    let opts = [
        "--ignore-errors",

        // set download dest
        "-P", destination,
        "--format", options.format,
        "--extract-audio",
        "--audio-format", options.audioformat,
        "--audio-quality", "0",
        "--output", filename,
        url
    ];
    let Download = new Promise((resolve, reject) => {
        const ytdlp = spawn('./binaries/' + YTDLP_BINARY, opts);
        ytdlp.stdout.on('data', data => {
            let output = data.toString().trim();
            console.log(output);
            if (output.startsWith(`${YTDLP_BINARY}: error:`)) reject(false);
        });
        
        ytdlp.on('error', error => {
            console.error(error.message);
            reject(false);
        });

        ytdlp.stderr.on('data', data => {
            console.error(data.toString().trim());
            reject(false);
        });

        ytdlp.on('exit', code => {
            if (code > 0) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    });

    return Download;
}

/**
 * Use yt=dlp to download video from a youtube url
 * @param {String} url youtube url
 * @param {String} destination download destination
 * @param {String} filename desired filename
 * @param {Object} options array of yt-dlp options
 * @returns {Promise}
 */
function downloadVideo(url, destination, filename, options = {extension: "mp4"}) {
    let opts = [
        "--ignore-errors",

        // set download dest
        "-P", destination,
        "-S", `res,ext:${options.extension}:m4a`,
        "--recode", options.extension,
        "--output", filename,
        url
    ];
    let Download = new Promise((resolve, reject) => {
        const ytdlp = spawn('./binaries/' + YTDLP_BINARY, opts);
        ytdlp.stdout.on('data', data => {
            let output = data.toString().trim();
            console.log(output);
            if (output.startsWith(`${YTDLP_BINARY}: error:`)) reject(false);
        });
        
        ytdlp.on('error', error => {
            console.error(error.message);
            reject(false);
        });

        ytdlp.stderr.on('data', data => {
            console.error(data.toString().trim());
            reject(false);
        });

        ytdlp.on('exit', code => {
            if (code > 0) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    });

    return Download;
}

function getPlaylistJson(url) {
    let opts = [
        "--ignore-errors",
        "--flat-playlist",
        "--print", "{\"url\": \"%(url)s\", \"title\": \"%(title)s\"}",
        `${url}`
    ];

    console.log(`getting playlist data for ${url}`);

    let PlaylistJson = new Promise((resolve, reject) => {
        const ytdlp = spawn('./binaries/' + YTDLP_BINARY, opts);
        let dataArray = [];
        ytdlp.stdout.on('data', data => {
            let output = data.toString().trim();
            dataArray.push(output);
        });
        
        ytdlp.on('error', error => {
            console.log(error);
            // reject(error);
        });

        ytdlp.stderr.on('data', data => {
            console.log(data.toString().trim());
            // reject(data.toString().trim());
        });

        ytdlp.on('exit', code => {
            if (code > 0) {
                reject(false);
            } else {
                let newArr = [];
                for (let json of dataArray) {
                    try {
                        let j = JSON.parse(json);
                        if (j.title !== "[Deleted video]") {
                            newArr.push({
                                url: j.url,
                                title: j.title
                            });
                        }
                    } catch (error) {
                        console.error(error.message);
                    }
                }
                resolve(newArr);
            }
        });
    });

    return PlaylistJson;
}

module.exports = {
    getVersion,
    getTitle,
    downloadAudio,
    downloadVideo,
    getPlaylistJson
}