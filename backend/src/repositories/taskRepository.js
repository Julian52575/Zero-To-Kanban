const db = require('../persistence');

async function getAll(projectId) {
  return db.getTasks(projectId);
}

async function getById(id) {
  return db.getTask(id);
}

async function create(columnId, creatorId, taskData) {
  return db.storeTask(columnId, creatorId, taskData);
}

async function update(id, taskData) {
  return db.updateTask(id, taskData);
}

async function deleteById(id) {
  return db.removeTask(id);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteById,
};