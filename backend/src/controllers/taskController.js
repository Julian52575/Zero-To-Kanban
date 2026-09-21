const taskService = require('../services/taskService');

async function getTasks(req, res) {
  const tasks = await taskService.getTasks(req.params.projectId);

  res.json(tasks);
}

async function getTask(req, res) {
  const task = await taskService.getTask(req.params.id);

  res.json(task);
}

async function createTask(req, res) {
  const { projectId } = req.params;
  const { columnId, title, description, assigneeId } = req.body;

  if (!columnId || !title) {
    return res.status(400).json({ error: "columnId and title fields are required" });
  }

  const task = await taskService.storeTask(columnId, creatorId, {
      title,
      description,
      assigneeId
  });

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