'use strict';

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const authenticated = require('./middleware/authenticated');
const verify = require('./routes/verify');
const login = require('./routes/login');
const logout = require('./routes/logout');
const logoutAll = require('./routes/logoutAll');
const me = require('./routes/me');

const PAGES_DIR = path.join(__dirname, 'pages');

function createApp() {
    const app = express();

    app.disable('x-powered-by');
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    // Liveness probe -- no auth. Used by the container healthcheck and CI.
    app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

    // Internal ForwardAuth target. The `auth` Traefik router does NOT match
    // /internal, so this is only reachable from Traefik itself.
    app.get('/internal/verify', verify);

    // Public auth API. TEMPORARY: login is username-only get-or-create.
    app.post('/auth/login', login);
    app.post('/auth/logout', logout);

    // Authenticated auth API.
    app.get('/auth/me', authenticated, me);
    app.post('/auth/logout-all', authenticated, logoutAll);

    // Minimal server-rendered page so the entire SPA can sit behind the guard
    // -- the sign-in screen does not depend on the frontend bundle.
    app.get('/login', (req, res) => res.sendFile(path.join(PAGES_DIR, 'login.html')));

    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        console.error('auth: unhandled error', err);
        res.status(500).json({ error: 'internal error' });
    });

    return app;
}

module.exports = { createApp };
