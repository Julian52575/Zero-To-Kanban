const taskRepository = require('../repositories/taskRepository');
const { publishEvent } = require('../events/eventBus');
const { EVENTS } = require("../events/events");

async function getTasks() {
  return taskRepository.getAll();
}

async function getTask(id) {
  return taskRepository.getById(id);
}

async function createTask(task) {
  const response = await taskRepository.create(task);
  await publishEvent(EVENTS.TASK_CREATED, response);
  return response;
}

async function updateTask(id, task) {
  const response = await taskRepository.update(id, task);
  await publishEvent(EVENTS.TASK_UPDATED, { id, old: task, new: response });
  return response;
}

async function deleteTask(id) {
  const response = await taskRepository.deleteById(id);
  await publishEvent(EVENTS.TASK_DELETED, { id });
  return response;
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};