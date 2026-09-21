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

// Deliberately permissive on charset (unlike username) -- just a length
// floor/ceiling. Complexity rules push users toward predictable patterns and
// are better enforced with a breach-list check than a regex; not doing that
// here, so keep this simple.
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // bcrypt silently truncates beyond 72 bytes

// Returns { password } (untouched -- no trim/case changes) or { error }.
function validatePassword(value) {
    if (typeof value !== 'string' || value.length < PASSWORD_MIN || value.length > PASSWORD_MAX) {
        return {
            error: `password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters`,
        };
    }
    return { password: value };
}

// Only allow a same-site absolute path as a post-login redirect target --
// never an absolute URL and never "//host" (protocol-relative), which would
// be an open redirect.
function safeNext(value) {
    return typeof value === 'string' && /^\/(?!\/)/.test(value) ? value : '/';
}

module.exports = { validateUsername, validatePassword, safeNext };
