'use strict';

const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;

// Returns { username } normalised (trimmed, lower-cased) or { error }.
function validateUsername(value) {
    const username = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!USERNAME_RE.test(username)) {
        return {
            error: 'username must be 3-32 characters: letters, digits, "-" or "_"',
        };
    }
    return { username };
}

// Only allow a same-site absolute path as a post-login redirect target --
// never an absolute URL and never "//host" (protocol-relative), which would
// be an open redirect.
function safeNext(value) {
    return typeof value === 'string' && /^\/(?!\/)/.test(value) ? value : '/';
}

module.exports = { validateUsername, safeNext };
