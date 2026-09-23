import React from "react";
import AddItemForm from "./AddItemForm";
import KanbanBoard from "./KanbanBoard";
import type { Item, ItemStatus } from "../types/item";
import { getItems, updateItem } from "../services/itemsApi";
import { getErrorMessage } from "../utils/errorMessage";

function TodoList() {
  const [items, setItems] = React.useState<Item[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getItems()
      .then((data) => setItems(data))
      .catch((error) => {
        console.error(error);
        setError(getErrorMessage(error));
      });
  }, []);

  const onNewItem = React.useCallback((newItem: Item) => {
    setItems((currentItems) =>
      currentItems === null ? [newItem] : [...currentItems, newItem],
    );
  }, []);

  const onItemUpdate = React.useCallback((item: Item) => {
    setItems((currentItems) =>
      currentItems === null
        ? null
        : currentItems.map((i) => (i.id === item.id ? item : i)),
    );
  }, []);

  const onItemRemoval = React.useCallback((item: Item) => {
    setItems((currentItems) =>
      currentItems === null
        ? null
        : currentItems.filter((i) => i.id !== item.id),
    );
  }, []);

  // Déplacement d'une carte : mise à jour optimiste + rollback si l'API échoue
  const onStatusChange = React.useCallback(
    (item: Item, status: ItemStatus) => {
      const updated: Item = {
        ...item,
        status,
        completed: status === "done",
      };
      onItemUpdate(updated);

      updateItem({
        id: updated.id,
        name: updated.name,
        completed: updated.completed,
        status,
      }).catch((err) => {
        console.error(err);
        onItemUpdate(item); // rollback
        setError(getErrorMessage(err));
      });
    },
    [onItemUpdate],
  );

  if (error !== null) {
    return <p className="text-center text-danger">{error}</p>;
  }

  if (items === null) {
    return <p className="text-center">Chargement…</p>;
  }

  return (
    <React.Fragment>
      <AddItemForm onNewItem={onNewItem} />
      <KanbanBoard
        items={items}
        onItemUpdate={onItemUpdate}
        onItemRemoval={onItemRemoval}
        onStatusChange={onStatusChange}
      />
    </React.Fragment>
  );
}

export default TodoList;
