const columnRepository = require('../repositories/projectRepository');

async function getColumns(userId, projectId) {
  const allowed = await columnRepository.userCanAccessProject(userId, projectId);
  if (!allowed) return null; // projet inexistant OU pas à cet utilisateur
  return columnRepository.getColumnsByProject(projectId);
}

module.exports = { getColumns };