'use strict';

// The SPA calls this to learn who is signed in (and to detect an expired
// session -> 401). `authenticated` middleware has already populated req.user.
module.exports = (req, res) => {
    res.json({ id: req.user.id, username: req.user.username });
};
