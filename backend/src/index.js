const express = require('express');
const app = express();
const db = require('./persistence');
const requireUser = require('./middleware/requireUser');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

app.use(express.json());

// Unauthenticated liveness probe (container healthcheck / CI). Must stay
// above requireUser.
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

// Everything below needs an identity asserted by the auth service and passed
// through by Traefik's ForwardAuth middleware.
app.use(requireUser);

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

db.init().then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
