require('dotenv').config();
const express = require('express');
const path = require('path');
const checkDependencies = require('./util/checkDependencies');
const checkCookie = require('./middleware/checkCookie');
const cookieParser = require('cookie-parser');
const convert = require('./routes/heic');
const ytdlp = require('./routes/ytdlp');
let skip = (process.env.SKIP_CHECK_DEPENDENCIES === "true");

checkDependencies(skip).then(() => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use('/api', convert);
    app.use('/api', ytdlp);
    app.use(express.static(path.join('./frontend')));

    app.get('/', checkCookie, function (req, res) {
        res.sendFile(path.join(__dirname, '/frontend/index.html'));
    });

    app.get('/ytdlp', checkCookie, function (req, res) {
        res.sendFile(path.join(__dirname, '/frontend/ytdlp.html'));
    });

    app.get('/ffmpeg', checkCookie, function (req, res) {
        res.sendFile(path.join(__dirname, '/frontend/ffmpeg.html'));
    });

    app.get('/api/deletecookie', function (req, res) {
        if (res.cookie) {
            console.log('clear cookie');
            res.clearCookie('id').sendStatus(200);
        } else {
            res.sendStatus(204)
        }
    });

    app.listen(process.env.PORT, function () {
        console.log(`app listening on port ${process.env.PORT} (pid ${process.pid})`);
    });
}).catch(error => {
    console.error(error);
});