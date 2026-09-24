const { z } = require("zod");

const taskStatusUpdatedSchema = z
    .object({
        taskId: z.string(),
        oldStatus: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
        newStatus: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
    })
    .strict();

module.exports = taskStatusUpdatedSchema;