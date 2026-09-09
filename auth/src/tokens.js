'use strict';

const jwt = require('jsonwebtoken');
const config = require('./config');

// The session cookie is a signed JWT. `ver` pins the token to the user's
// `tokenVersion` at mint time; bumping that column (log-out-everywhere)
// invalidates every outstanding token for that user.
function signSession(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, ver: user.tokenVersion },
        config.sessionSecret,
        { expiresIn: config.sessionTtlSeconds },
    );
}

function verifySession(token) {
    try {
        return jwt.verify(token, config.sessionSecret);
    } catch {
        return null;
    }
}

module.exports = { signSession, verifySession };
