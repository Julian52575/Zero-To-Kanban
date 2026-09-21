'use strict';

const bcrypt = require('bcryptjs');
const db = require('../db');
const { validateUsername, validatePassword, safeNext } = require('../validation');
const { signSession } = require('../tokens');
const { setSessionCookie } = require('../cookies');
const { primeTokenVersion } = require('../revocation');

const SALT_ROUNDS = 12;

module.exports = async (req, res) => {
    const username = validateUsername(req.body.username);
    if (username.error) {
        return res.status(400).json({ error: username.error });
    }
    const password = validatePassword(req.body.password);
    if (password.error) {
        return res.status(400).json({ error: password.error });
    }

    const passwordHash = await bcrypt.hash(password.password, SALT_ROUNDS);

    let user;
    try {
        user = await db.createUser(username.username, passwordHash);
    } catch (err) {
        if (err instanceof db.UsernameTakenError) {
            return res.status(409).json({ error: 'cet identifiant existe déjà, veuillez en choisir un autre' });
        }
        throw err;
    }

    // Register logs the user straight in, same as login.
    primeTokenVersion(user.id, user.tokenVersion);
    setSessionCookie(res, signSession(user));
    res.status(201).json({
        id: user.id,
        username: user.username,
        next: safeNext(req.body.next),
    });
};
