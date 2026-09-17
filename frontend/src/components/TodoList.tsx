import React from 'react';
import AddItemForm from './AddItemForm';
import ItemDisplay from './ItemDisplay';
import type { Item } from '../types/item';
import { getItems } from '../services/itemsApi';
import { getErrorMessage } from '../utils/errorMessage';

function TodoList() {
    const [items, setItems] = React.useState<Item[] | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    React.useEffect(() => {
        getItems()
            .then(data => setItems(data))
            .catch(error => {
                console.error(error);
                setError(getErrorMessage(error));
            });
    }, []);
    const onNewItem = React.useCallback(
        (newItem: Item) => {
            setItems(currentItems => {
                if (currentItems === null) {
                    return [newItem];
                }
                return [...currentItems, newItem];
            });
        },
        [],
    );
    const onItemUpdate = React.useCallback(
        (item: Item) => {
            setItems(currentItems => {
                if (currentItems === null) {
                    return null;
                }
                const index = currentItems.findIndex(
                    i => i.id === item.id,
                );
                if (index === -1) {
                    return currentItems;
                }
                return [
                    ...currentItems.slice(0, index),
                    item,
                    ...currentItems.slice(index + 1),
                ];
            });
        },
        [],
    );
    const onItemRemoval = React.useCallback(
        (item: Item) => {
            setItems(currentItems => {
                if (currentItems === null) {
                    return null;
                }
                const index = currentItems.findIndex(
                    i => i.id === item.id,
                );
                if (index === -1) {
                    return currentItems;
                }
                return [
                    ...currentItems.slice(0, index),
                    ...currentItems.slice(index + 1),
                ];
            });
        },
        [],
    );
    if (error !== null) {
        return (
            <p className="text-center text-danger">
                {error}
            </p>
        );
    }
    if (items === null) {
        return 'Loading...';
    }
    return (
        <React.Fragment>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center">
                    No items yet! Add one above!
                </p>
            )}
            {items.map(item => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </React.Fragment>
    );
}

export default TodoList;