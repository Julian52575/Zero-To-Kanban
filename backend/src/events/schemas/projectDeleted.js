const { z } = require("zod");

const projectDeletedSchema = z.object({
    projectId: z.string(),
});

module.exports = projectDeletedSchema;
