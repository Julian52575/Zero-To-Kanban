const taskRepository = require("../repositories/taskRepository");
const { publishEvent } = require("../events/eventBus");
const { EVENTS } = require("../events/events");
const { userCanAccessProject } = require("../persistence");

async function getTasks(projectId) {
  return taskRepository.getAll(projectId);
}

async function getTask(id) {
  return taskRepository.getById(id);
}

async function createTask(columnId, creatorId, taskData) {
  const response = await taskRepository.create(columnId, creatorId, taskData);
  try {
    await publishEvent(EVENTS.TASK_CREATED, response);
  } catch (error) {
    console.error("Error publishing task created event:", error);
  }
  return response;
}

async function updateTask(id,userId, taskData) {
  if (!(await userCanAccessProject(userId, taskData.projectId))) {
    return null;
  }
  const task = await taskRepository.getById(id);
  if (!task) {
    return null;
  }
  const response = await taskRepository.update(id, taskData);
  return response;
}

async function deleteTask(id, userId) {
  const task = await taskRepository.getById(id);

  if (!task) {
    return null;
  }

  if (!(await userCanAccessProject(userId, task.projectId))) {
    return false;
  }

  return await taskRepository.deleteById(id);
}
module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
