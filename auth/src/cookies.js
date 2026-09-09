'use strict';

const config = require('./config');

// SameSite=Lax is enough here: the frontend, API and auth service are all one
// origin behind Traefik, and Lax still lets the top-level redirect from
// /internal/verify carry the cookie back. `secure` is off for plain-HTTP local
// dev and MUST be on once the proxy terminates HTTPS (COOKIE_SECURE=true).
function baseOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.cookieSecure,
        path: '/',
    };
}

function setSessionCookie(res, token) {
    res.cookie(config.cookieName, token, {
        ...baseOptions(),
        maxAge: config.sessionTtlSeconds * 1000,
    });
}

function clearSessionCookie(res) {
    res.clearCookie(config.cookieName, baseOptions());
}

module.exports = { setSessionCookie, clearSessionCookie };
