const { v4: uuid } = require('uuid');
const projectRepository = require('../repositories/projectRepository');

async function createProject(data) {
    const project = {
        id: uuid(),
        name: data.name.trim(),
    };

    return projectRepository.create(project);
}

async function getProjects() {
    return projectRepository.getAll();
}

async function getProject(id) {
    return projectRepository.getById(id);
}

module.exports = {
    createProject,
    getProjects,
    getProject,
};