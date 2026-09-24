const { z } = require("zod");

// Mirrors the Project model; extend alongside it.
const projectCreatedSchema = z.object({
    projectId: z.string(),
    name: z.string(),
});

module.exports = projectCreatedSchema;
