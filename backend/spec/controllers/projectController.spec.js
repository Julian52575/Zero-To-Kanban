jest.mock('../../src/services/projectService');
jest.mock('../../src/events/eventBus', () => ({
    publishEvent: jest.fn(),
}));

const projectService = require('../../src/services/projectService');
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