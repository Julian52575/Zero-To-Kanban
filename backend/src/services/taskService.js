const taskRepository = require('../repositories/taskRepository');

async function getTasks() {
  return taskRepository.getAll();
}

async function getTask(id) {
  return taskRepository.getById(id);
}

async function createTask(task) {
  return taskRepository.create(task);
}

async function updateTask(id, task) {
  return taskRepository.update(id, task);
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