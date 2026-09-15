const { z } = require("zod");

const projectCreatedSchema = z.object({
    projectId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
    priority: z.number(),
    deadline: z.string().nullable(),
});

module.exports = projectCreatedSchema;