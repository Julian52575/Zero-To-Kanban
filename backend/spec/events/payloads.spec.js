// Contract test: what the services and controllers publish must pass the
// schema eventBus validates against, or publishEvent throws at runtime.

const { EVENT_SCHEMAS, EVENTS } = require("../../src/events/events");
const { taskPayload, projectPayload } = require("../../src/events/payloads");

const item = { id: "item-id", name: "Task", completed: false };
const project = { id: "project-id", name: "Projet", createdAt: new Date() };

const accepts = (eventName, payload) =>
  EVENT_SCHEMAS[eventName].safeParse(payload).success;

describe("event payloads", () => {
  test("taskPayload maps a stored item", () => {
    expect(taskPayload(item)).toEqual({
      taskId: "item-id",
      name: "Task",
      completed: false,
    });
  });

  test("projectPayload maps a stored project", () => {
    expect(projectPayload(project)).toEqual({
      projectId: "project-id",
      name: "Projet",
    });
  });

  test.each([
    [EVENTS.TASK_CREATED, taskPayload(item)],
    [EVENTS.TASK_UPDATED, taskPayload(item)],
    [EVENTS.TASK_DELETED, { taskId: item.id }],
    [EVENTS.PROJECT_CREATED, projectPayload(project)],
    [EVENTS.PROJECT_UPDATED, projectPayload(project)],
    [EVENTS.PROJECT_DELETED, { projectId: project.id }],
  ])("%s accepts what is published", (eventName, payload) => {
    expect(accepts(eventName, payload)).toBe(true);
  });
});
