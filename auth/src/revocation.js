'use strict';

const config = require('./config');
const db = require('./db');

// /internal/verify runs on EVERY request Traefik proxies to a guarded router,
// so it cannot hit Postgres each time. Cache each user's current tokenVersion
// for a few seconds.
//
//   * a local revoke (logout-all / password change) calls primeTokenVersion()
//     so this replica is correct immediately;
//   * other auth replicas converge within VERIFY_CACHE_TTL_MS.
//
// Trade-off: a revoked session can linger for up to that TTL on replicas that
// did not process the revoke. Keep the TTL small (default 5s).

const cache = new Map(); // userId -> { version: number|null, expiresAt: number }

async function currentTokenVersion(userId) {
    const now = Date.now();
    const hit = cache.get(userId);
    if (hit && hit.expiresAt > now) {
        return hit.version;
    }
    const user = await db.findUserById(userId);
    const version = user ? user.tokenVersion : null; // null => unknown user
    cache.set(userId, { version, expiresAt: now + config.verifyCacheTtlMs });
    return version;
}

function primeTokenVersion(userId, version) {
    cache.set(userId, {
        version,
        expiresAt: Date.now() + config.verifyCacheTtlMs,
    });
}

// Drop expired entries so the map cannot grow without bound under user churn.
const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache) {
        if (value.expiresAt <= now) {
            cache.delete(key);
        }
    }
}, 60_000);
if (typeof sweep.unref === 'function') {
    sweep.unref();
}

module.exports = { currentTokenVersion, primeTokenVersion };
