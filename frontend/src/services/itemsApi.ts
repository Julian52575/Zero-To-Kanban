import apiClient from './apiClient';
import type { Item } from '../types/item';

export const getItems = (): Promise<Item[]> => {
    return apiClient.get<Item[]>('/items');
};

export const createItem = (name: string): Promise<Item> => {
    return apiClient.post<Item>('/items', {
        name,
    });
};

export const updateItem = (
    item: Item,
): Promise<Item> => {
    return apiClient.put<Item>(`/items/${item.id}`, {
        name: item.name,
        completed: item.completed,
    });
};

export const deleteItem = (id: string): Promise<void> => {
    return apiClient.delete(`/items/${id}`);
};