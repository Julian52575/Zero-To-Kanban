jest.mock('../../src/services/projectService');
jest.mock('../../src/events/eventBus', () => ({
    publishEvent: jest.fn(),
}));

const projectService = require('../../src/services/projectService');
const { publishEvent } = require('../../src/events/eventBus');
const { EVENTS } = require('../../src/events/events');
const projectController = require('../../src/controllers/projectController');

describe('projectController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createProject', () => {
        it('should create a project and return 201', async () => {
            const project = {
                id: 'project-id',
                name: 'Mon projet',
            };

            projectService.createProject.mockResolvedValue(project);

            const req = {
                body: {
                    name: 'Mon projet',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await projectController.createProject(req, res);

            expect(
                projectService.createProject
            ).toHaveBeenCalledWith(req.body);

            expect(publishEvent).toHaveBeenCalledWith(
                EVENTS.PROJECT_CREATED,
                { projectId: 'project-id', name: 'Mon projet' }
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(project);
        });
    });

    describe('getProjects', () => {
        it('should return all projects', async () => {
            const projects = [
                {
                    id: '1',
                    name: 'Projet 1',
                },
                {
                    id: '2',
                    name: 'Projet 2',
                },
            ];

            projectService.getProjects.mockResolvedValue(projects);

            const req = {};

            const res = {
                json: jest.fn(),
            };

            await projectController.getProjects(req, res);

            expect(
                projectService.getProjects
            ).toHaveBeenCalledTimes(1);

            expect(res.json).toHaveBeenCalledWith(projects);
        });
    });

    describe('getProject', () => {
        it('should return a project by id', async () => {
            const project = {
                id: 'project-id',
                name: 'Mon projet',
            };

            projectService.getProject.mockResolvedValue(project);

            const req = {
                params: {
                    id: 'project-id',
                },
            };

            const res = {
                json: jest.fn(),
            };

            await projectController.getProject(req, res);

            expect(
                projectService.getProject
            ).toHaveBeenCalledWith('project-id');

            expect(res.json).toHaveBeenCalledWith(project);
        });

        it('should return 404 when project does not exist', async () => {
            projectService.getProject.mockResolvedValue(null);

            const req = {
                params: {
                    id: 'unknown-id',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await projectController.getProject(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Project not found',
            });
        });
    });
});

    describe('updateProject', () => {
        it('should update a project, publish the event and return it', async () => {
            const project = {
                id: 'project-id',
                name: 'Nouveau nom',
            };

            projectService.updateProject.mockResolvedValue(project);

            const req = {
                params: {
                    id: 'project-id',
                },
                body: {
                    name: 'Nouveau nom',
                },
            };

            const res = {
                json: jest.fn(),
            };

            await projectController.updateProject(req, res);

            expect(
                projectService.updateProject
            ).toHaveBeenCalledWith('project-id', req.body);

            expect(publishEvent).toHaveBeenCalledWith(
                EVENTS.PROJECT_UPDATED,
                { projectId: 'project-id', name: 'Nouveau nom' }
            );

            expect(res.json).toHaveBeenCalledWith(project);
        });
    });

    describe('deleteProject', () => {
        it('should delete a project, publish the event and return 200', async () => {
            projectService.deleteProject.mockResolvedValue();

            const req = {
                params: {
                    id: 'project-id',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                end: jest.fn(),
            };

            await projectController.deleteProject(req, res);

            expect(
                projectService.deleteProject
            ).toHaveBeenCalledWith('project-id');

            expect(publishEvent).toHaveBeenCalledWith(
                EVENTS.PROJECT_DELETED,
                { projectId: 'project-id' }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.end).toHaveBeenCalledTimes(1);
        });
    });
});
