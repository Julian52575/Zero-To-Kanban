'use strict';

// In the deployed stack every request reaches this API through Traefik, which
// runs the `require-login` ForwardAuth middleware first and injects a trusted
// `X-Auth-User-Id` header (client-supplied copies are dropped by the
// `strip-identity` middleware). A request without the header therefore either
// bypassed the proxy or arrived before auth was wired up -- reject it.
//
// TODO(#59-follow-up): use req.userId to scope todo_items to their owner
// (needs an `owner_id` column + a data migration for existing rows).
module.exports = (req, res, next) => {
    const userId = req.get('X-Auth-User-Id');
    if (!userId) {
        return res.status(401).json({ error: 'authentication required' });
    }
    req.userId = userId;
    req.userName = req.get('X-Auth-User-Name') || null;
    next();
};
