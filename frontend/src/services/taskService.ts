import apiClient from "./apiClient";
import { taskSchema, tasksSchema } from "../schemas/taskSchema";
import type { Task, CreateTaskInput, UpdateTaskInput } from "../types/task";

const base = (projectId: string) => `/api/projects/${projectId}/tasks`;

export const getTasks = async (projectId: string): Promise<Task[]> => {
  const data = await apiClient.get<Task[]>(base(projectId));
  return tasksSchema.parse(data);
};

export const getTask = async (projectId: string, id: string): Promise<Task> => {
  const data = await apiClient.get<Task>(`${base(projectId)}/${id}`);
  return taskSchema.parse(data);
};

export const createTask = async (
  projectId: string,
  input: CreateTaskInput
): Promise<Task> => {
  const data = await apiClient.post<Task>(base(projectId), input);
  return taskSchema.parse(data);
};

export const updateTask = async (
  projectId: string,
  id: string,
  input: UpdateTaskInput
): Promise<Task> => {
  const data = await apiClient.put<Task>(`${base(projectId)}/${id}`, input);
  return taskSchema.parse(data);
};

// Déplacement dans le kanban : changement de colonne et/ou de position
export const moveTask = (
  projectId: string,
  id: string,
  columnId: string,
  order: number
): Promise<Task> => updateTask(projectId, id, { columnId, order });

export const deleteTask = (projectId: string, id: string): Promise<void> => {
  return apiClient.delete(`${base(projectId)}/${id}`);
};