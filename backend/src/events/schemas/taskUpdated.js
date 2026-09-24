const { z } = require("zod");

// Mirrors the TodoItem model; extend alongside it.
const taskUpdatedSchema = z.object({
    taskId: z.string(),
    name: z.string(),
    completed: z.boolean(),
});

module.exports = taskUpdatedSchema;
