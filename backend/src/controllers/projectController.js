const projectService = require('../services/projectService');

async function createProject(req, res) {
    const project = await projectService.createProject(req.body);

    res.status(201).json(project);
}

async function getProjects(req, res) {
    const projects = await projectService.getProjects();

    res.json(projects);
}

async function getProject(req, res) {
    const project = await projectService.getProject(req.params.id);

    if (!project) {
        return res.status(404).json({
            error: 'Project not found',
        });
    }

    res.json(project);
}

module.exports = {
    createProject,
    getProjects,
    getProject,
};