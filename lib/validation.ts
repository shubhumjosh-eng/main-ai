import { z } from 'zod';

export const TaskSchema = z.object({
  task: z.string().min(1, 'Task is required').max(10000, 'Task too long'),
  sender: z.string().max(100).default('anonymous'),
});

export const TaskUpdateSchema = z.object({
  taskId: z.string(),
  status: z.enum(['pending', 'working', 'done', 'failed']),
  result: z.string().optional(),
});

export type TaskInput = z.infer<typeof TaskSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
