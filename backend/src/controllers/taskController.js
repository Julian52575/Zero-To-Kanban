const taskService = require("../services/taskService");
const { EVENTS } = require("../events/events");
const { publishEvent } = require("../events/eventBus");
const {
  userCanAccessProject,
  columnBelongsToProject,
  storeTask,
} = require("../persistence");

async function getTasks(req, res) {
  const tasks = await taskService.getTasks(req.params.projectId);

  res.json(tasks);
}

async function getTask(req, res) {
  const task = await taskService.getTask(req.params.id);

  res.json(task);
}

async function createTask(req, res, next) {
  try {
    const { projectId } = req.params;
    const creatorId = req.userId;
    const { title, description, columnId, assigneeId } = req.body;

    if (!(await userCanAccessProject(creatorId, projectId))) {
      return res.status(404).json({ error: "project not found" });
    }

    if (!(await columnBelongsToProject(columnId, projectId))) {
      return res.status(400).json({ error: "invalid column" });
    }

    const task = await storeTask(columnId, creatorId, {
      title,
      description,
      assigneeId,
    });

    try {
      await publishEvent(EVENTS.TASK_CREATED, task);
    } catch (error) {
      console.error("Failed to publish TASK_CREATED event:", error);
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res) {
  const userId = req.userId;
  const taskId = req.params.id;
  const task = await taskService.updateTask(taskId, userId, req.body);
  try {
    await publishEvent(EVENTS.TASK_UPDATED, task);
  } catch (error) {
    console.error("Failed to publish TASK_UPDATED event:", error);
  }

  res.json(task);
}

async function deleteTask(req, res) {
  const userId = req.userId;
  const taskId = req.params.id;

  const rep = await taskService.deleteTask(taskId, userId);

  if (rep === null) {
    return res.status(404).json({ error: "task not found" });
  }

  if (rep === false) {
    return res.status(403).json({ error: "forbidden" });
  }

  try {
    await publishEvent(EVENTS.TASK_DELETED, { id: taskId });
  } catch (error) {
    console.error("Failed to publish TASK_DELETED event:", error);
  }

  return res.status(204).end();
}
module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
