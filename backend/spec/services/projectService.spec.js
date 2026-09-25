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
                ownerId: 'owner-id',
            });

            expect(projectRepository.create).toHaveBeenCalledTimes(1);

            const projectPassedToRepository =
                projectRepository.create.mock.calls[0][0];

            expect(projectPassedToRepository).toHaveProperty('id');
            expect(typeof projectPassedToRepository.id).toBe('string');

            expect(projectPassedToRepository.name).toBe(
                'Mon projet'
            );
            expect(projectPassedToRepository.ownerId).toBe('owner-id');

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

            const result = await projectService.getProjects('owner-id');

            expect(projectRepository.getAll).toHaveBeenCalledWith('owner-id');
            expect(result).toEqual(projects);
        });
    });

    const project = {
        id: 'project-id',
        name: 'Mon projet',
        ownerId: 'owner-id',
    };

    describe('getProject', () => {
        it("should return the owner's project", async () => {
            projectRepository.getById.mockResolvedValue(project);

            const result = await projectService.getProject(
                'project-id',
                'owner-id'
            );

            expect(projectRepository.getById).toHaveBeenCalledWith(
                'project-id'
            );
            expect(result).toEqual(project);
        });

        it('should return null when the project does not exist', async () => {
            projectRepository.getById.mockResolvedValue(null);

            const result = await projectService.getProject(
                'unknown-id',
                'owner-id'
            );

            expect(result).toBeNull();
        });

        it("should return null for someone else's project", async () => {
            projectRepository.getById.mockResolvedValue(project);

            const result = await projectService.getProject(
                'project-id',
                'intruder-id'
            );

            expect(result).toBeNull();
        });
    });

    describe('updateProject', () => {
        it('should save a trimmed name and return both versions', async () => {
            const updatedProject = { ...project, name: 'Nouveau nom' };

            projectRepository.getById.mockResolvedValue(project);
            projectRepository.update.mockResolvedValue(updatedProject);

            const result = await projectService.updateProject(
                'project-id',
                'owner-id',
                { name: '  Nouveau nom  ' }
            );

            expect(projectRepository.update).toHaveBeenCalledWith(
                'project-id',
                { name: 'Nouveau nom' }
            );
            expect(result).toEqual({
                before: project,
                after: updatedProject,
            });
        });

        it('should return null when the project does not exist', async () => {
            projectRepository.getById.mockResolvedValue(null);

            const result = await projectService.updateProject(
                'unknown-id',
                'owner-id',
                { name: 'Nouveau nom' }
            );

            expect(result).toBeNull();
            expect(projectRepository.update).not.toHaveBeenCalled();
        });

        it("should not update someone else's project", async () => {
            projectRepository.getById.mockResolvedValue(project);

            const result = await projectService.updateProject(
                'project-id',
                'intruder-id',
                { name: 'Nouveau nom' }
            );

            expect(result).toBeNull();
            expect(projectRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteProject', () => {
        it("should delete the owner's project", async () => {
            projectRepository.getById.mockResolvedValue(project);
            projectRepository.deleteProject.mockResolvedValue(project);

            const result = await projectService.deleteProject(
                'project-id',
                'owner-id'
            );

            expect(projectRepository.deleteProject).toHaveBeenCalledWith(
                'project-id'
            );
            expect(result).toEqual(project);
        });

        it('should return null when the project does not exist', async () => {
            projectRepository.getById.mockResolvedValue(null);

            const result = await projectService.deleteProject(
                'unknown-id',
                'owner-id'
            );

            expect(result).toBeNull();
            expect(projectRepository.deleteProject).not.toHaveBeenCalled();
        });

        it("should not delete someone else's project", async () => {
            projectRepository.getById.mockResolvedValue(project);

            const result = await projectService.deleteProject(
                'project-id',
                'intruder-id'
            );

            expect(result).toBeNull();
            expect(projectRepository.deleteProject).not.toHaveBeenCalled();
        });
    });
});
