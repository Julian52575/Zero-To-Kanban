'use strict';

const config = require('../config');
const { verifySession } = require('../tokens');
const { currentTokenVersion } = require('../revocation');

// Guards the login service's OWN authenticated endpoints (/auth/me,
// /auth/logout-all). Same checks as /internal/verify, but it always answers
// JSON 401 -- these are API calls from the SPA, never navigations that should
// be redirected to /login.
module.exports = async (req, res, next) => {
    const token = req.cookies ? req.cookies[config.cookieName] : undefined;
    const claims = token && verifySession(token);
    if (!claims) {
        return res.status(401).json({ error: 'not authenticated' });
    }

    const version = await currentTokenVersion(claims.sub);
    if (version === null || version !== claims.ver) {
        return res.status(401).json({ error: 'session revoked' });
    }

    req.user = { id: claims.sub, username: claims.username, tokenVersion: version };
    next();
};
