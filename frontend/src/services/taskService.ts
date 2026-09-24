import apiClient from "./apiClient";
import { taskSchema, tasksSchema } from "../schemas/taskSchema";
import type { Task, CreateTaskInput, UpdateTaskInput } from "../types/task";

export const getTasks = async (projectId: string): Promise<Task[]> => {
  const data: Task[] = await apiClient.get(`/projects/${projectId}/tasks`);
  return tasksSchema.parse(data);
};

export const getTask = async (projectId: string, id: string): Promise<Task> => {
  const data: Task = await apiClient.get(`/projects/${projectId}/tasks/${id}`);
  return taskSchema.parse(data);
};

export const createTask = async (
  projectId: string,
  input: CreateTaskInput
): Promise<Task> => {
  const data: Task = await apiClient.post(`/projects/${projectId}/tasks`, input);
  return taskSchema.parse(data);
};

export const updateTask = async (
  projectId: string,
  id: string,
  input: UpdateTaskInput
): Promise<Task> => {
  const data: Task = await apiClient.put(`/projects/${projectId}/tasks/${id}`, input);
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
  return apiClient.delete(`/projects/${projectId}/tasks/${id}`);
};