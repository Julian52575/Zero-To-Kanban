jest.mock('../../src/repositories/projectRepository', () => ({
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
}));

jest.mock('../../src/events/eventBus');

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-project-id'),
}));

const request = require('supertest');
const app = require('../../src/app');

const projectRepository = require('../../src/repositories/projectRepository');

describe('Project routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /projects', () => {
        it('should create a project', async () => {
            const project = {
                id: 'test-project-id',
                name: 'Mon projet',
            };

            projectRepository.create.mockResolvedValue(project);

            const response = await request(app)
                .post('/projects')
                .send({ name: 'Mon projet' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(project);

            expect(projectRepository.create).toHaveBeenCalledWith({
                id: 'test-project-id',
                name: 'Mon projet',
            });
        });

        it('should reject a project without a name', async () => {
            const response = await request(app)
                .post('/projects')
                .send({});

            expect(response.status).toBe(400);
            expect(projectRepository.create).not.toHaveBeenCalled();
        });

        it('should reject a project with an invalid name', async () => {
            const response = await request(app)
                .post('/projects')
                .send({
                    name: 123,
                });

            expect(response.status).toBe(400);
            expect(projectRepository.create).not.toHaveBeenCalled();
        });

        it('should reject an empty project name', async () => {
            const response = await request(app)
                .post('/projects')
                .send({
                    name: '   ',
                });

            expect(response.status).toBe(400);
            expect(projectRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('GET /projects', () => {
        it('should return the list of projects', async () => {
            const projects = [
                {
                    id: 'project-1',
                    name: 'Projet 1',
                },
                {
                    id: 'project-2',
                    name: 'Projet 2',
                },
            ];

            projectRepository.getAll.mockResolvedValue(projects);

            const response = await request(app)
                .get('/projects');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(projects);

            expect(projectRepository.getAll).toHaveBeenCalledTimes(1);
        });

        it('should return created projects in the list', async () => {
            const projects = [
                {
                    id: 'test-project-id',
                    name: 'Projet listing',
                },
            ];

            projectRepository.getAll.mockResolvedValue(projects);

            const response = await request(app)
                .get('/projects');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(projects);
        });
    });

    describe('GET /projects/:id', () => {
        it('should return a project by its id', async () => {
            const project = {
                id: 'test-project-id',
                name: 'Projet selection',
            };

            projectRepository.getById.mockResolvedValue(project);

            const response = await request(app)
                .get('/projects/test-project-id');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(project);

            expect(projectRepository.getById).toHaveBeenCalledWith(
                'test-project-id'
            );
        });

        it('should return 404 when project does not exist', async () => {
            projectRepository.getById.mockResolvedValue(null);

            const response = await request(app)
                .get(
                    '/projects/00000000-0000-0000-0000-000000000000'
                );

            expect(response.status).toBe(404);

            expect(response.body).toEqual({
                error: 'Project not found',
            });

            expect(projectRepository.getById).toHaveBeenCalledWith(
                '00000000-0000-0000-0000-000000000000'
            );
        });
    });
});