const itemRepository = require("../repositories/itemRepository");
const { randomUUID: uuid } = require("crypto");
const { publishEvent } = require("../events/eventBus");
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
  const createdItem = await itemRepository.create(item);
  try {
    await publishEvent(EVENTS.TASK_CREATED, taskPayload(createdItem));
  } catch (error) {
    console.error("Failed to publish TASK_CREATED event:", error);
  }
  return createdItem;
}

async function deleteItem(id) {
  const rep = await itemRepository.deleteById(id);
  try {
    await publishEvent(EVENTS.TASK_DELETED, { taskId: id });
  } catch (error) {
    console.error("Failed to publish TASK_DELETED event:", error);
  }
  return rep;
}

async function updateItem(id, data) {
  const item = {
    name: data.name,
    completed: data.completed,
  };

  await itemRepository.updateById(id, item);

  const updated = await itemRepository.getById(id);
  try {
    await publishEvent(EVENTS.TASK_UPDATED, taskPayload(updated));
  } catch (error) {
    console.error("Failed to publish TASK_UPDATED event:", error);
  }
  return updated;
}

module.exports = {
  getItems,
  getItem,
  createItem,
  deleteItem,
  updateItem,
};
