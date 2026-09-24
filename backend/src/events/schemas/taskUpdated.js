const { z } = require("zod");

const taskUpdatedSchema = z
    .object({
        taskId: z.string(),
        projectId: z.string(),
        name: z.string(),
        status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
        priority: z.number(),
        deadline: z.string().nullable(),
    })
    .strict();

module.exports = taskUpdatedSchema;
