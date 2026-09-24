const projectService = require('../services/projectService');
const { EVENTS } = require("../events/events");
const { publishEvent } = require("../events/eventBus");
const { projectPayload } = require("../events/payloads");

async function createProject(req, res) {
    const project = await projectService.createProject(req.body);

    await publishEvent(EVENTS.PROJECT_CREATED, projectPayload(project));

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

async function updateProject(req, res) {
    const project = await projectService.updateProject(
        req.params.id,
        req.body
    );

    await publishEvent(EVENTS.PROJECT_UPDATED, projectPayload(project));

    res.json(project);
}

async function deleteProject(req, res) {
    await projectService.deleteProject(req.params.id);

    await publishEvent(EVENTS.PROJECT_DELETED, { projectId: req.params.id });

    res.status(200).end();
}

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
};