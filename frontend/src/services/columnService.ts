// src/services/columnService.ts
import apiClient from "./apiClient";

export type Column = { id: string; name: string; order: number };

export const getColumns = async (projectId: string): Promise<Column[]> => {
  const cols = await apiClient.get<Column[]>(`/api/projects/${projectId}/columns`);
  return [...cols].sort((a, b) => a.order - b.order);
};