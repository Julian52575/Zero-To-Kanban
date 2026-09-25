import { z } from "zod";

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  order: z.number(),
  columnId: z.string(),
  creatorId: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  // coerce transforme la string ISO envoyée par l'API en Date
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const tasksSchema = z.array(taskSchema);