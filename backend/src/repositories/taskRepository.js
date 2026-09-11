const db = require('../persistence');

async function getAll() {
  return db.getItems();
}

async function getById(id) {
  return db.getItem(id);
}

async function create(task) {
  return db.storeItem(task);
}

async function update(id, task) {
  return db.updateItem(id, task);
}

async function deleteById(id) {
  return db.removeItem(id);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteById,
};