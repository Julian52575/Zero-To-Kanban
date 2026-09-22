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

async function updateProject(id, data) {
    const project = await projectRepository.getById(id);
    if (!project) {
        throw new Error('Project not found');
    }

    project.name = data.name.trim();

    return projectRepository.update(project);
}

async function deleteProject(id) {
    const project = await projectRepository.getById(id);
    if (!project) {
        throw new Error('Project not found');
    }

    return projectRepository.delete(id);
}

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
};