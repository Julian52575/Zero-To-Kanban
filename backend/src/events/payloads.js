// Maps a stored model to the payload of its events (see ./schemas).

function taskPayload(item) {
  return {
    taskId: item.id,
    name: item.name,
    completed: item.completed,
  };
}

function projectPayload(project) {
  return {
    projectId: project.id,
    name: project.name,
  };
}

module.exports = {
  taskPayload,
  projectPayload,
};
