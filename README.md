# selfhosted-downloader

A front and backend mainly for yt-dlp to help make editing metadata less painful

The goal of this project is to try and use as few package dependencies as I can

## how to use

1. `git clone` this repo

2. Run: `cd selfhosted-downloader && npm install`

3. Create `.env` in project root, or rename `example.env` to `.env`:

```env
PORT=3000 # backend port number
SKIP_CHECK_DEPENDENCIES=false # skip binaries and folder check. also skips yt-dlp download
DOWNLOAD_DIR="./downloads" # path to downloads folder
YTDLP_BINARY="yt-dlp_linux" # yt-dlp, yt-dlp_linux, yt-dlp.exe
YTDLP_RELEASES_URL="https://api.github.com/repos/yt-dlp/yt-dlp/releases" # url for getting latest yt-dlp release tag
YTDLP_SRC_URL="https://github.com/yt-dlp/yt-dlp/releases/download" # url for getting the actual binary release
```
Feel free to change these, leave the YTDLP url's alone though

- PORT: The default port number for the backend
- SKIP_CHECK_DEPENDENCIES: Skips checking for yt-dlp binary and downloads folder
- DOWNLOAD_DIR: Default is ./downloads, but you can change it to be somewhere else. This is just for temporary files before sending back to the browser. This folder will be created automatically
- YTDLP_BINARY: The name of the binary. for linux, it is "yt-dlp_linux" unless it has been installed from your package manager
- YTDLP_RELEASES_URL: The url to check for the latest yt-dlp version
- YTDLP_SRC_URL: The url to get the actual binary

4. Start the webserver: `node index.js`
    - With SKIP_CHECK_DEPENDENCIEs=false, the backend will check for yt-dlp updates on startup
5. In your browser, go to `http://[ip, hostname or localhost]:3000`


## info

On startup, the backend will check for yt-dlp updates and download the latest version. If there is an issue with the binary, download yt-dlp from https://github.com/yt-dlp/yt-dlp/releases/, place the downloaded binary in a `./binaries` folder in the project root and set the YT_DLP_BINARY and SKIP_CHECK_DEPENDENCIES environment variables accordingly

## more info

This program is really only designed to be used by one user (me). There may be issues if you host this at home and have multiple people access the yt-dlp portion of the website. I haven't written worker code to elminate any potential blocking issues but it should at least be asyncronus
