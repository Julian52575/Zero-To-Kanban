import React from 'react';
import AddItemForm from './AddItemForm';
import ItemDisplay from './ItemDisplay';
import type { Item } from '../types/item';

function TodoList() {
    const [items, setItems] = React.useState<Item[] | null>(null);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then((data: Item[]) => setItems(data));
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

