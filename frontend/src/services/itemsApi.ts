import apiClient from './apiClient';
import { itemSchema, itemsSchema } from '../schemas/itemSchema';
import type { Item } from '../types/item';

export const getItems = async (): Promise<Item[]> => {
    const data = await apiClient.get<unknown>('/api/items');
    return itemsSchema.parse(data);
};

export const createItem = async (name: string): Promise<Item> => {
    const data = await apiClient.post<unknown>('/api/items', {
        name,
    });
    return itemSchema.parse(data);
};

export const updateItem = async (item: Item): Promise<Item> => {
    const data = await apiClient.put<unknown>(`/api/items/${item.id}`, {
        name: item.name,
        completed: item.completed,
    });
    return itemSchema.parse(data);
};

export const deleteItem = (id: string): Promise<void> => {
    return apiClient.delete(`/api/items/${id}`);
};