import { z } from 'zod';

export const projectSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt : z.date().optional(),
});

export const projectsSchema = z.array(projectSchema);

export type Project = z.infer<typeof projectSchema>;