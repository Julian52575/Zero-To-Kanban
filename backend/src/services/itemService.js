const itemRepository = require('../repositories/itemRepository');
const { randomUUID: uuid } = require('crypto');

const { publishEvent } = require('../events/eventBus');
const { EVENTS } = require("../events/events");
const { taskPayload } = require("../events/payloads");


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
    const created = await itemRepository.create(item);

    await publishEvent(EVENTS.TASK_CREATED, taskPayload(created));

    return created;
}

async function deleteItem(id) {
    await itemRepository.deleteById(id);

    await publishEvent(EVENTS.TASK_DELETED, { taskId: id });
}

async function updateItem(id, data) {
    const item = {
        name: data.name,
        completed: data.completed,
    };

    await itemRepository.updateById(id, item);

    const updated = await itemRepository.getById(id);

    await publishEvent(EVENTS.TASK_UPDATED, taskPayload(updated));

    return updated;
}

module.exports = {
    getItems,
    getItem,
    createItem,
    deleteItem,
    updateItem,
};