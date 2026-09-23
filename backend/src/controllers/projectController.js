const projectService = require('../services/projectService');
const { EVENTS } = require("../events/events");
const { publishEvent } = require("../events/eventBus");

async function createProject(req, res) {
    const project = await projectService.createProject({
        name: req.body.name,
        ownerId : req.userId
    });
    try {
        await publishEvent(EVENTS.PROJECT_CREATED, project);
    } catch (error) {
        console.error('Failed to publish PROJECT_CREATED event:', error);
    }

    res.status(201).json(project);
}

async function getProjects(req, res) {
    const projects = await projectService.getProjects(req.userId);

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

    try {
        await publishEvent(EVENTS.PROJECT_UPDATED, {
            id: req.params.id,
            beforeUpdate: project,
            afterUpdate: req.body,
        });
    } catch (error) {
        console.error('Failed to publish PROJECT_UPDATED event:', error);
    }

    res.json(project);
}

async function deleteProject(req, res) {
    await projectService.deleteProject(req.params.id);

    try {
        await publishEvent(EVENTS.PROJECT_DELETED, { id: req.params.id });
    } catch (error) {
        console.error('Failed to publish PROJECT_DELETED event:', error);
    }

    res.status(200).end();
}

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
};