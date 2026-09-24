const { z } = require("zod");

// Mirrors the TodoItem model; extend alongside it.
const taskCreatedSchema = z.object({
    taskId: z.string(),
    name: z.string(),
    completed: z.boolean(),
});

module.exports = taskCreatedSchema;
