const { z } = require("zod");
const projectSchema = require("./project");

const projectUpdatedSchema = z.object({
  id: z.string().uuid(),
  beforeUpdate: projectSchema,
  afterUpdate: projectSchema,
});

module.exports = projectUpdatedSchema;
