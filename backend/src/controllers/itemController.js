const itemService = require('../services/itemService');

async function getItems(req, res) {
    const items = await itemService.getItems();
    res.send(items);
}

async function getItem(req, res) {
    const item = await itemService.getItem(req.params.id);
    res.send(item);
}

async function addItem(req, res) {
    const item = await itemService.createItem(req.body);

    res.send(item);
}

async function deleteItem(req, res) {
    await itemService.deleteItem(req.params.id);

    res.sendStatus(200);
}

async function updateItem(req, res) {
    const item = await itemService.updateItem(
        req.params.id,
        req.body
    );

    res.send(item);
}

module.exports = {
    getItems,
    getItem,
    addItem,
    deleteItem,
    updateItem,
};