const { z } = require("zod");

const projectCreatedSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  createdAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  ownerId: z.string().uuid(),
  columns: z.array(z.object({})),
});

module.exports = projectCreatedSchema;
