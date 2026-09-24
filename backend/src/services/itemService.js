const itemRepository = require("../repositories/itemRepository");
const { v4: uuid } = require("uuid");
const { publishEvent } = require("../events/eventBus");
const { EVENTS } = require("../events/events");

async function getItems() {
  return itemRepository.getAll();
}

async function getItem(id) {
  return itemRepository.getById(id);
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
    await publishEvent(EVENTS.TASK_CREATED, createdItem);
  } catch (error) {
    console.error("Failed to publish TASK_CREATED event:", error);
  }
  return createdItem;
}

async function deleteItem(id) {
  const rep = itemRepository.deleteById(id);
  try {
    await publishEvent(EVENTS.TASK_DELETED, { id });
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

  try {
    await publishEvent(EVENTS.TASK_UPDATED, { id, ...item });
  } catch (error) {
    console.error("Failed to publish TASK_UPDATED event:", error);
  }

  return itemRepository.getById(id);
}

module.exports = {
  getItems,
  getItem,
  getItem,
  createItem,
  deleteItem,
  updateItem,
};
