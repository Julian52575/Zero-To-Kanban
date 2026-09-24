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

async function update(project) {
    return db.updateProject(project);
}

async function deleteById(id) {
    return db.removeProject(id);
}

module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: deleteById,
};