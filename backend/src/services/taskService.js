const taskRepository = require('../repositories/taskRepository');
const { publishEvent } = require('../events/eventBus');
const { EVENTS } = require("../events/events");
const { taskPayload } = require("../events/payloads");

async function getTasks() {
  return taskRepository.getAll();
}

async function getTask(id) {
  return taskRepository.getById(id);
}

async function createTask(task) {
  const response = await taskRepository.create(task);
  await publishEvent(EVENTS.TASK_CREATED, taskPayload(response));
  return response;
}

async function updateTask(id, task) {
  await taskRepository.update(id, task);
  const response = await taskRepository.getById(id);
  await publishEvent(EVENTS.TASK_UPDATED, taskPayload(response));
  return response;
}

async function deleteTask(id) {
  const response = await taskRepository.deleteById(id);
  await publishEvent(EVENTS.TASK_DELETED, { taskId: id });
  return response;
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};