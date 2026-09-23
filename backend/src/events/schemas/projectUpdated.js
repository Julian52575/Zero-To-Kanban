const { z } = require("zod");

const projectUpdatedSchema = z.object({
  id: z.string().uuid(),
  beforeUpdate: z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    createdAt: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      })
      .optional(),
    ownerId: z.string().uuid(),
    columns: z.array(z.object({})),
  }),
  afterUpdate: z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    createdAt: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      })
      .optional(),
    ownerId: z.string().uuid(),
    columns: z.array(z.object({})),
  }),
});

module.exports = projectUpdatedSchema;
