const { z } = require("zod");

const projectUpdatedSchema = z.object({
    taskId: z.string(),
    projectId: z.string(),
    name: z.string(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
    priority: z.number(),
    deadline: z.string().nullable(),
});

module.exports = projectUpdatedSchema;
