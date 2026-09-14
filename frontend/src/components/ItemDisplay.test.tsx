import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemDisplay from './ItemDisplay';
import type { Item } from '../types/item';

describe('ItemDisplay', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    const item: Item = { id: '1', name: 'Buy milk', completed: false };

    test('renders the item name', () => {
        render(
            <ItemDisplay
                item={item}
                onItemUpdate={vi.fn()}
                onItemRemoval={vi.fn()}
            />,
        );

        expect(screen.getByText('Buy milk')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Mark item as complete' }),
        ).toBeInTheDocument();
    });

    test('shows the completed affordance for a completed item', () => {
        render(
            <ItemDisplay
                item={{ ...item, completed: true }}
                onItemUpdate={vi.fn()}
                onItemRemoval={vi.fn()}
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Mark item as incomplete' }),
        ).toBeInTheDocument();
    });

    test('toggling completion PUTs the flipped item and reports it back', async () => {
        const user = userEvent.setup();
        const onItemUpdate = vi.fn();
        const updatedItem = { ...item, completed: true };

        (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            json: () => Promise.resolve(updatedItem),
        });

        render(
            <ItemDisplay
                item={item}
                onItemUpdate={onItemUpdate}
                onItemRemoval={vi.fn()}
            />,
        );

        await user.click(
            screen.getByRole('button', { name: 'Mark item as complete' }),
        );

        expect(fetch).toHaveBeenCalledWith('/items/1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Buy milk', completed: true }),
            headers: { 'Content-Type': 'application/json' },
        });

        await waitFor(() =>
            expect(onItemUpdate).toHaveBeenCalledWith(updatedItem),
        );
    });

    test('removing the item DELETEs it and reports it back', async () => {
        const user = userEvent.setup();
        const onItemRemoval = vi.fn();

        (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({});

        render(
            <ItemDisplay
                item={item}
                onItemUpdate={vi.fn()}
                onItemRemoval={onItemRemoval}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Remove Item' }));

        expect(fetch).toHaveBeenCalledWith('/items/1', { method: 'DELETE' });

        await waitFor(() => expect(onItemRemoval).toHaveBeenCalledWith(item));
    });
});
