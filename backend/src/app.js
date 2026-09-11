const express = require('express');

const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

const {
    validateCreateItem,
    validateUpdateItem,
    validateItemId,
} = require('./middlewares/itemValidation');

const app = express();

app.use(express.json());

app.get('/items', getItems);

app.post(
    '/items',
    validateCreateItem,
    addItem
);

app.put(
    '/items/:id',
    validateItemId,
    validateUpdateItem,
    updateItem
);

app.delete(
    '/items/:id',
    validateItemId,
    deleteItem
);

module.exports = app;