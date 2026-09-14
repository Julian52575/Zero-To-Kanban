const taskService = require('../services/taskService');

async function getTasks(req, res) {
  const tasks = await taskService.getTasks();

  res.json(tasks);
}

async function getTask(req, res) {
  const task = await taskService.getTask(req.params.id);

  res.json(task);
}

async function createTask(req, res) {
  const task = await taskService.createTask(req.body);

  res.status(201).json(task);
}

async function updateTask(req, res) {
  const task = await taskService.updateTask(
    req.params.id,
    req.body
  );

  res.json(task);
}

async function deleteTask(req, res) {
  await taskService.deleteTask(req.params.id);

  res.status(200).end();
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};