# selfhosted-downloader

A front and backend mainly for yt-dlp to help making editing metadata less painful

The goal of this project is to try and use as few package dependencies as I can

## how to use

1. git clone this repo

2. run: `cd selfhosted-downloader && npm install`

3. create this .env file in project root:

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
- YTDLP_BINARY: the name of the binary. for linux, it is "yt-dlp_linux" unless it has been installed from your package manager
- YTDLP_RELEASES_URL: the url to check for the latest yt-dlp version
- YTDLP_SRC_URL: the url to get the actual binary

4. start the webserver: `node index.js`

5. in your browser, go to `http://[ip, hostname or localhost]:3000`

