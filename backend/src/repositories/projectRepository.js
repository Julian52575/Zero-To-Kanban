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

async function getTasksByProjectId(projectId) {
    return db.getTasksByProjectId(projectId);
}

async function deleteProject(id) {
    return db.deleteProject(id);
}

module.exports = {
    create,
    getAll,
    getById,
    getTasksByProjectId,
    deleteProject,
};