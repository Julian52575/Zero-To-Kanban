import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddItemForm from './AddItemForm';

describe('AddItemForm', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    test('the submit button is disabled until text is entered', async () => {
        const user = userEvent.setup();
        render(<AddItemForm onNewItem={vi.fn()} />);

        const button = screen.getByRole('button', { name: /add item/i });
        expect(button).toBeDisabled();

        await user.type(screen.getByPlaceholderText('New Item'), 'Buy milk');

        expect(button).toBeEnabled();
    });

    test('submitting posts the new item and reports it back', async () => {
        const user = userEvent.setup();
        const onNewItem = vi.fn();
        const createdItem = { id: '1', name: 'Buy milk', completed: false };

        (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            json: () => Promise.resolve(createdItem),
        });

        render(<AddItemForm onNewItem={onNewItem} />);

        await user.type(screen.getByPlaceholderText('New Item'), 'Buy milk');
        await user.click(screen.getByRole('button', { name: /add item/i }));

        expect(fetch).toHaveBeenCalledWith('/items', {
            method: 'POST',
            body: JSON.stringify({ name: 'Buy milk' }),
            headers: { 'Content-Type': 'application/json' },
        });

        await waitFor(() => expect(onNewItem).toHaveBeenCalledWith(createdItem));

        expect(screen.getByPlaceholderText('New Item')).toHaveValue('');
    });
});
