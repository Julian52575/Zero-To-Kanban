'use strict';

const bcrypt = require('bcryptjs');
const db = require('../db');
const { validateUsername, safeNext } = require('../validation');
const { signSession } = require('../tokens');
const { setSessionCookie } = require('../cookies');
const { primeTokenVersion } = require('../revocation');

// Same message whether the username doesn't exist or the password is wrong --
// never let a client distinguish the two (username enumeration).
const INVALID_CREDENTIALS = { error: 'identifiant ou mot de passe incorrect' };

module.exports = async (req, res) => {
    const parsed = validateUsername(req.body.username);
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (parsed.error || !password) {
        return res.status(400).json(INVALID_CREDENTIALS);
    }

    const user = await db.findUserByUsername(parsed.username);
    // Always run bcrypt.compare, even with no user, against a fixed dummy
    // hash -- otherwise a missing user short-circuits and the response time
    // leaks whether the username exists (timing side channel).
    const hash = user ? user.passwordHash : '$2a$12$UTeN8JFNW7IlNk2jSBUXGuPIeYnXOrqUIYcsHLLNYwCYgfBlnXd3K';
    const ok = await bcrypt.compare(password, hash);
    if (!user || !ok) {
        return res.status(401).json(INVALID_CREDENTIALS);
    }

    primeTokenVersion(user.id, user.tokenVersion);
    setSessionCookie(res, signSession(user));
    res.json({
        id: user.id,
        username: user.username,
        next: safeNext(req.body.next),
    });
};
