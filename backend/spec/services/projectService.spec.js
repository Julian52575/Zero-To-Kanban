jest.mock('../../src/repositories/projectRepository');

const projectRepository = require('../../src/repositories/projectRepository');
const projectService = require('../../src/services/projectService');

describe('projectService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createProject', () => {
        it('should create a project with an id and a trimmed name', async () => {
            const createdProject = {
                id: 'project-id',
                name: 'Mon projet',
            };

            projectRepository.create.mockResolvedValue(createdProject);

            const result = await projectService.createProject({
                name: '  Mon projet  ',
            });

            expect(projectRepository.create).toHaveBeenCalledTimes(1);

            const projectPassedToRepository =
                projectRepository.create.mock.calls[0][0];

            expect(projectPassedToRepository).toHaveProperty('id');
            expect(typeof projectPassedToRepository.id).toBe('string');

            expect(projectPassedToRepository.name).toBe(
                'Mon projet'
            );

            expect(result).toEqual(createdProject);
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

            projectRepository.getAll.mockResolvedValue(projects);

            const result = await projectService.getProjects();

            expect(projectRepository.getAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(projects);
        });
    });

    describe('getProject', () => {
        it('should return a project by its id', async () => {
            const project = {
                id: 'project-id',
                name: 'Mon projet',
            };

            projectRepository.getById.mockResolvedValue(project);

            const result = await projectService.getProject(
                'project-id'
            );

            expect(projectRepository.getById).toHaveBeenCalledWith(
                'project-id'
            );

            expect(result).toEqual(project);
        });

        it('should return null when the project does not exist', async () => {
            projectRepository.getById.mockResolvedValue(null);

            const result = await projectService.getProject(
                'unknown-id'
            );

            expect(projectRepository.getById).toHaveBeenCalledWith(
                'unknown-id'
            );

            expect(result).toBeNull();
        });
    });
});