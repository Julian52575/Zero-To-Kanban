const db = require('../persistence');

async function getAll() {
    return db.getItems();
}

async function create(item) {
    return db.storeItem(item);
}

async function deleteById(id) {
    return db.removeItem(id);
}

async function updateById(id, data) {
    return db.updateItem(id, data);
}

async function getById(id) {
    return db.getItem(id);
}

module.exports = {
    getAll,
    create,
    deleteById,
    updateById,
    getById,
};