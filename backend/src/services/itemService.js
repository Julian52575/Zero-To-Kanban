const itemRepository = require('../repositories/itemRepository');
const { randomUUID: uuid } = require('crypto');

const { publishEvent } = require('../events/eventBus');
const { EVENTS } = require("../events/events");


async function getItems() {
    return itemRepository.getAll();
}

async function getItem(id) {
    return itemRepository.getById(id);
}

async function createItem(data) {
    const item = {
        id: uuid(),
        name: data.name,
        completed: false,
    };
    await publishEvent(EVENTS.TASK_CREATED, item);

    return itemRepository.create(item);
}

async function deleteItem(id) {
    const rep = itemRepository.deleteById(id);
    await publishEvent(EVENTS.TASK_DELETED, { id });
    return rep;
}

async function updateItem(id, data) {
    const item = {
        name: data.name,
        completed: data.completed,
    };

    await itemRepository.updateById(id, item);

    await publishEvent(EVENTS.TASK_UPDATED, { id, ...item });

    return itemRepository.getById(id);
}

module.exports = {
    getItems,
    getItem,
    createItem,
    deleteItem,
    updateItem,
};