jest.mock('../../src/events/eventBus', () => ({
    publishEvent: jest.fn(),
}));

jest.mock('../../src/repositories/projectRepository', () => {
    const mockProjects = new Map();

    return {
        create: jest.fn(async (project) => {
            mockProjects.set(project.id, project);
            return project;
        }),
        getAll: jest.fn(async () => [...mockProjects.values()]),
        getById: jest.fn(async (id) => mockProjects.get(id) ?? null),
    };
});

const request = require('supertest');
const app = require('../../src/app');

describe('Project routes', () => {
    describe('POST /projects', () => {
        it('should create a project', async () => {
            const response = await request(app)
                .post('/projects')
                .send({
                    name: 'Mon projet',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Mon projet');
        });

        it('should reject a project without a name', async () => {
            const response = await request(app)
                .post('/projects')
                .send({});

            expect(response.status).toBe(400);
        });

        it('should reject a project with an invalid name', async () => {
            const response = await request(app)
                .post('/projects')
                .send({
                    name: 123,
                });

            expect(response.status).toBe(400);
        });

        it('should reject an empty project name', async () => {
            const response = await request(app)
                .post('/projects')
                .send({
                    name: '   ',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /projects', () => {
        it('should return the list of projects', async () => {
            const response = await request(app)
                .get('/projects');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return created projects in the list', async () => {
            await request(app)
                .post('/projects')
                .send({
                    name: 'Projet listing',
                });

            const response = await request(app)
                .get('/projects');

            expect(response.status).toBe(200);

            const project = response.body.find(
                (project) => project.name === 'Projet listing'
            );

            expect(project).toBeDefined();
            expect(project).toHaveProperty('id');
            expect(project).toHaveProperty(
                'name',
                'Projet listing'
            );
        });
    });

    describe('GET /projects/:id', () => {
        it('should return a project by its id', async () => {
            const createResponse = await request(app)
                .post('/projects')
                .send({
                    name: 'Projet selection',
                });

            const projectId = createResponse.body.id;

            const response = await request(app)
                .get(`/projects/${projectId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty(
                'id',
                projectId
            );
            expect(response.body).toHaveProperty(
                'name',
                'Projet selection'
            );
        });

        it('should return 404 when project does not exist', async () => {
            const response = await request(app)
                .get(
                    '/projects/00000000-0000-0000-0000-000000000000'
                );

            expect(response.status).toBe(404);

            expect(response.body).toEqual({
                error: 'Project not found',
            });
        });
    });
});