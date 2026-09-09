'use strict';

const db = require('../db');
const { validateUsername, safeNext } = require('../validation');
const { signSession } = require('../tokens');
const { setSessionCookie } = require('../cookies');
const { primeTokenVersion } = require('../revocation');

// TEMPORARY sign-in: a username and nothing else. A new username is created;
// an existing one is reused. No password, no verification -- the web team owns
// the real auth UX. The microservice still mints a revocable session and the
// ForwardAuth / middleware contract is unchanged.
module.exports = async (req, res) => {
    const parsed = validateUsername(req.body.username);
    if (parsed.error) {
        return res.status(400).json({ error: parsed.error });
    }

    const user = await db.getOrCreateUser(parsed.username);

    primeTokenVersion(user.id, user.tokenVersion);
    setSessionCookie(res, signSession(user));
    res.json({
        id: user.id,
        username: user.username,
        next: safeNext(req.body.next),
    });
};
