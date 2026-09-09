'use strict';

const config = require('../config');
const { verifySession } = require('../tokens');
const { currentTokenVersion } = require('../revocation');
const { safeNext } = require('../validation');

// Traefik ForwardAuth target. Traefik calls this for every request to a
// guarded router, forwarding the original request's headers plus X-Forwarded-*.
//
//   2xx  -> Traefik proxies the request upstream and copies the
//           X-Auth-User-* response headers onto it (authResponseHeaders).
//   any other status / a redirect -> Traefik returns THIS response to the
//           client instead of proxying.
//
// So an unauthenticated browser navigation gets a 302 to /login, while an
// unauthenticated API/XHR call gets a plain 401 for the frontend to handle.
module.exports = async (req, res) => {
    const token = req.cookies ? req.cookies[config.cookieName] : undefined;
    const claims = token && verifySession(token);

    if (claims) {
        const version = await currentTokenVersion(claims.sub);
        if (version !== null && version === claims.ver) {
            res.set('X-Auth-User-Id', claims.sub);
            res.set('X-Auth-User-Name', claims.username);
            return res.sendStatus(200);
        }
    }

    const original = req.get('x-forwarded-uri') || '/';
    const wantsHtml = (req.get('accept') || '').includes('text/html');
    if (wantsHtml) {
        const next = encodeURIComponent(safeNext(original));
        return res.redirect(302, `${publicOrigin(req)}/login?next=${next}`);
    }
    return res.status(401).json({ error: 'authentication required' });
};

// Build the browser-facing origin from the headers Traefik forwards on the
// ForwardAuth sub-request, so the 302 always points at the public entrypoint
// (e.g. http://localhost:8000) and never at this service's internal address.
function publicOrigin(req) {
    const first = (value) => (value || '').split(',')[0].trim();
    const proto = first(req.get('x-forwarded-proto')) || 'http';
    const host = first(req.get('x-forwarded-host')) || first(req.get('host'));
    return host ? `${proto}://${host}` : '';
};
