const taskRepository = require('../repositories/taskRepository');

async function getTasks(projectId) {
  return taskRepository.getAll(projectId);
}

async function getTask(id) {
  return taskRepository.getById(id);
}

async function createTask(columnId, creatorId, taskData) {
  return taskRepository.create(columnId, creatorId, taskData);
}

async function updateTask(id, taskData) {
  return taskRepository.update(id, taskData);
}

async function deleteTask(id) {
  return taskRepository.deleteById(id);
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};