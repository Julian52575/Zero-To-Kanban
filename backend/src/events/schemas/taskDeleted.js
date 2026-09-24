const { z } = require("zod");

const taskDeletedSchema = z
    .object({
        taskId: z.string(),
    })
    .strict();

module.exports = taskDeletedSchema;