'use strict';

const { clearSessionCookie } = require('../cookies');

// Single-session logout: drop the cookie on THIS client only. Other sessions
// for the same user stay valid. Use POST /auth/logout-all to revoke every
// session (see routes/logoutAll.js).
module.exports = (req, res) => {
    clearSessionCookie(res);
    res.sendStatus(204);
};
