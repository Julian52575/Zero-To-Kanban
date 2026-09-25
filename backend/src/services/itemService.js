const itemRepository = require('../repositories/itemRepository');
const { v4: uuid } = require('uuid');

async function getItems() {
    return itemRepository.getAll();
}

async function createItem(data) {
    const item = {
        id: uuid(),
        name: data.name,
        completed: false,
    };

    return itemRepository.create(item);
}

async function deleteItem(id) {
    return itemRepository.deleteById(id);
}

async function updateItem(id, data) {
    const item = {
        name: data.name,
        completed: data.completed,
    };

    await itemRepository.updateById(id, item);

    return itemRepository.getById(id);
}

module.exports = {
    getItems,
    createItem,
    deleteItem,
    updateItem,
};