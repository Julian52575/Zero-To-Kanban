// Maps a stored model to the payload of its events (see ./schemas).

function itemPayload(item) {
  return {
    taskId: item.id,
    name: item.name,
    completed: item.completed,
  };
}

function taskPayload(task, projectId) {
  return {
    taskId: task.id,
    projectId,
    columnId: task.columnId,
    title: task.title,
    description: task.description ?? null,
    order: task.order,
    creatorId: task.creatorId,
    assigneeId: task.assigneeId ?? null,
  };
}

function projectPayload(project) {
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt
      ? new Date(project.createdAt).toISOString()
      : undefined,
    ownerId: project.ownerId,
    columns: project.columns ?? [],
  };
}

module.exports = {
  itemPayload,
  taskPayload,
  projectPayload,
};
