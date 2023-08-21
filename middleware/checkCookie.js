const uuid = require('uuid');

/**
 * Set a cookie to help with controlling downloads
 * 
 * Value is a uuid, used to help create a temp download directory
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function checkCookie(req, res, next) {
    let cookie = req.cookies.id;
    if (cookie === undefined) {
        let date = new Date();
        let id = uuid.v4();
        date.setDate(date.getDate() + 1);
        res.cookie('id', id, {
            expires: date,
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });
    } else {
        console.log(cookie);
    }
    next();
}

module.exports = checkCookie;