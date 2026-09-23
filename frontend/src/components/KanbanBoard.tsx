import React from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Item, ItemStatus } from '../types/item';
import ItemDisplay from './ItemDisplay';
import './KanbanBoard.css';

const COLUMNS: { id: ItemStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'doing', title: 'Doing' },
    { id: 'done', title: 'Done' },
];

// Si l'item n'a pas encore de statut, on le déduit de "completed"
export function getStatus(item: Item): ItemStatus {
    if (item.status) return item.status;
    return item.completed ? 'done' : 'todo';
}

interface KanbanBoardProps {
    items: Item[];
    onItemUpdate: (item: Item) => void;
    onItemRemoval: (item: Item) => void;
    onStatusChange: (item: Item, status: ItemStatus) => void;
}

function KanbanCard({
    item,
    onItemUpdate,
    onItemRemoval,
}: {
    item: Item;
    onItemUpdate: (item: Item) => void;
    onItemRemoval: (item: Item) => void;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: item.id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`kanban-card${isDragging ? ' is-dragging' : ''}`}
        >
            <button
                type="button"
                className="kanban-handle"
                aria-label={`Déplacer "${item.name}"`}
                {...listeners}
                {...attributes}
            >
                ⠿
            </button>
            <div className="kanban-card-body">
                <ItemDisplay
                    item={item}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            </div>
        </div>
    );
}

function KanbanColumn({
    id,
    title,
    count,
    children,
}: {
    id: ItemStatus;
    title: string;
    count: number;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <section
            ref={setNodeRef}
            className={`kanban-column kanban-column-${id}${isOver ? ' is-over' : ''}`}
            aria-label={title}
        >
            <header className="kanban-column-header">
                <h2>{title}</h2>
                <span className="kanban-count">{count}</span>
            </header>
            <div className="kanban-column-body">
                {count === 0 && (
                    <p className="kanban-empty">Drag tasks here</p>
                )}
                {children}
            </div>
        </section>
    );
}

function KanbanBoard({
    items,
    onItemUpdate,
    onItemRemoval,
    onStatusChange,
}: KanbanBoardProps) {
    const [activeId, setActiveId] = React.useState<Item['id'] | null>(null);

    // distance: 6 évite de déclencher un drag lors d'un simple clic
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor),
    );

    const activeItem = React.useMemo(
        () => items.find(i => i.id === activeId) ?? null,
        [items, activeId],
    );

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as Item['id']);
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const item = items.find(i => i.id === active.id);
        const newStatus = over.id as ItemStatus;
        if (!item || getStatus(item) === newStatus) return;

        onStatusChange(item, newStatus);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveId(null)}
        >
            <div className="kanban-board">
                {COLUMNS.map(column => {
                    const columnItems = items.filter(
                        i => getStatus(i) === column.id,
                    );
                    return (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            count={columnItems.length}
                        >
                            {columnItems.map(item => (
                                <KanbanCard
                                    key={item.id}
                                    item={item}
                                    onItemUpdate={onItemUpdate}
                                    onItemRemoval={onItemRemoval}
                                />
                            ))}
                        </KanbanColumn>
                    );
                })}
            </div>

            <DragOverlay>
                {activeItem && (
                    <div className="kanban-card is-overlay">
                        <span className="kanban-handle" aria-hidden="true">
                            ⠿
                        </span>
                        <div className="kanban-card-body">
                            {activeItem.name}
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}

export default KanbanBoard;