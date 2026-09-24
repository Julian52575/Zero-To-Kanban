import { describe, test, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import KanbanBoard, { getStatus } from './KanbanBoard';
import type { Item } from '../types/item';

describe('getStatus', () => {
    test('uses the explicit status when there is one', () => {
        expect(getStatus({ id: '1', name: 'a', completed: true, status: 'doing' })).toBe('doing');
    });

    test('falls back to "completed" when there is no status', () => {
        expect(getStatus({ id: '1', name: 'a', completed: true })).toBe('done');
        expect(getStatus({ id: '1', name: 'a', completed: false })).toBe('todo');
    });
});

describe('KanbanBoard', () => {
    const items: Item[] = [
        { id: '1', name: 'Buy milk', completed: false, status: 'todo' },
        { id: '2', name: 'Write report', completed: false, status: 'doing' },
        { id: '3', name: 'Walk dog', completed: true, status: 'done' },
        { id: '4', name: 'Pay rent', completed: false, status: 'todo' },
    ];

    function renderBoard(boardItems: Item[] = items) {
        render(
            <KanbanBoard
                items={boardItems}
                onItemRename={vi.fn()}
                onItemDelete={vi.fn()}
                onStatusChange={vi.fn()}
            />,
        );
    }

    test('renders each item in the column matching its status', () => {
        renderBoard();

        const todo = screen.getByRole('region', { name: 'To Do' });
        const doing = screen.getByRole('region', { name: 'Doing' });
        const done = screen.getByRole('region', { name: 'Done' });

        expect(within(todo).getByText('Buy milk')).toBeInTheDocument();
        expect(within(todo).getByText('Pay rent')).toBeInTheDocument();
        expect(within(doing).getByText('Write report')).toBeInTheDocument();
        expect(within(done).getByText('Walk dog')).toBeInTheDocument();
        expect(within(done).queryByText('Buy milk')).not.toBeInTheDocument();
    });

    test('shows a count per column and a placeholder for empty columns', () => {
        renderBoard([items[0]]);

        const todo = screen.getByRole('region', { name: 'To Do' });
        const doing = screen.getByRole('region', { name: 'Doing' });

        expect(within(todo).getByText('1')).toBeInTheDocument();
        expect(within(todo).queryByText('Drag tasks here')).not.toBeInTheDocument();
        expect(within(doing).getByText('0')).toBeInTheDocument();
        expect(within(doing).getByText('Drag tasks here')).toBeInTheDocument();
    });

    test('gives every card a drag handle', () => {
        renderBoard();

        expect(screen.getByRole('button', { name: 'Déplacer "Buy milk"' })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /^Déplacer/ })).toHaveLength(items.length);
    });
});
