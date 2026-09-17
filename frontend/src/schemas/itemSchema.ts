import { z } from 'zod';

export const itemSchema = z.object({
    id: z.string(),
    name: z.string(),
    completed: z.boolean(),
});

export const itemsSchema = z.array(itemSchema);

export type Item = z.infer<typeof itemSchema>;