const db = require('../persistence');

async function create(project) {
    return db.createProject(project);
}

async function getAll(userId) {
    return db.getProjects(userId);
}

async function getById(id) {
    return db.getProject(id);
}

async function deleteProject(id) {
    return db.deleteProject(id);
}

async function getColumnsByProject(projectId) {
  return db.getColumns(projectId);
}

async function userCanAccessProject(userId, projectId) {
  return db.userCanAccessProject(userId, projectId);
}

module.exports = {
    create,
    getAll,
    getById,
    deleteProject,
    getColumnsByProject,
    userCanAccessProject,
};