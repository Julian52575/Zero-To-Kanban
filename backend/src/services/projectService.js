const { randomUUID: uuid } = require("crypto");
const projectRepository = require("../repositories/projectRepository");

async function createProject(data) {
  const project = {
    id: uuid(),
    name: data.name.trim(),
    ownerId : data.ownerId,
  };

  return projectRepository.create(project);
}

async function getProjects(userId) {
  return projectRepository.getAll(userId);
}

// Projects belong to their owner: for anyone else they don't exist (null).
async function getProject(id, userId) {
  const project = await projectRepository.getById(id);
  if (!project || project.ownerId !== userId) {
    return null;
  }
  return project;
}

async function updateProject(id, userId, data) {
  const before = await getProject(id, userId);
  if (!before) {
    return null;
  }

  const after = await projectRepository.update(id, { name: data.name.trim() });

  return { before, after };
}

async function deleteProject(id, userId) {
  const project = await getProject(id, userId);
  if (!project) {
    return null;
  }

  return projectRepository.deleteProject(id);
}

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
