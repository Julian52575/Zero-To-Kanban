'use strict';

const db = require('../db');
const { clearSessionCookie } = require('../cookies');
const { primeTokenVersion } = require('../revocation');

// Global revoke. Bumping tokenVersion makes every previously issued token for
// this user fail /internal/verify (immediately on this replica; within the
// verify-cache TTL on any others). Also clears the caller's own cookie.
module.exports = async (req, res) => {
    const newVersion = await db.bumpTokenVersion(req.user.id);
    primeTokenVersion(req.user.id, newVersion);
    clearSessionCookie(res);
    res.sendStatus(204);
};
