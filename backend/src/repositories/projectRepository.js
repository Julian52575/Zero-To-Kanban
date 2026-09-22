const db = require('../persistence');

async function create(project) {
    return db.createProject(project);
}

async function getAll() {
    return db.getProjects();
}

async function getById(id) {
    return db.getProject(id);
}

module.exports = {
    create,
    getAll,
    getById,
};