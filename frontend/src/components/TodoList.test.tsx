import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from './TodoList';

describe('TodoList', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    test('shows a loading message before items arrive', () => {
        (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

        render(<TodoList />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('fetches and renders the items', async () => {
        (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            json: () =>
                Promise.resolve([
                    { id: '1', name: 'Buy milk', completed: false },
                    { id: '2', name: 'Walk dog', completed: true },
                ]),
        });

        render(<TodoList />);

        expect(await screen.findByText('Buy milk')).toBeInTheDocument();
        expect(screen.getByText('Walk dog')).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith('/items');
    });

    test('shows an empty-state message when there are no items', async () => {
        (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            json: () => Promise.resolve([]),
        });

        render(<TodoList />);

        expect(
            await screen.findByText('No items yet! Add one above!'),
        ).toBeInTheDocument();
    });

    test('adding an item appends it to the list', async () => {
        const user = userEvent.setup();
        (fetch as ReturnType<typeof vi.fn>).mockImplementation(
            (url: string, options?: RequestInit) => {
                if (!options) {
                    return Promise.resolve({ json: () => Promise.resolve([]) });
                }

                return Promise.resolve({
                    json: () =>
                        Promise.resolve({ id: '9', name: 'New item', completed: false }),
                });
            },
        );

        render(<TodoList />);

        await screen.findByText('No items yet! Add one above!');

        await user.type(screen.getByPlaceholderText('New Item'), 'New item');
        await user.click(screen.getByRole('button', { name: /add item/i }));

        expect(await screen.findByText('New item')).toBeInTheDocument();
    });

    test('toggling an item updates it in place', async () => {
        const user = userEvent.setup();
        (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
            if (url === '/items') {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve([
                            { id: '1', name: 'Buy milk', completed: false },
                        ]),
                });
            }

            return Promise.resolve({
                json: () =>
                    Promise.resolve({ id: '1', name: 'Buy milk', completed: true }),
            });
        });

        render(<TodoList />);

        await screen.findByText('Buy milk');
        await user.click(
            screen.getByRole('button', { name: 'Mark item as complete' }),
        );

        expect(
            await screen.findByRole('button', {
                name: 'Mark item as incomplete',
            }),
        ).toBeInTheDocument();
    });

    test('removing an item drops it from the list', async () => {
        const user = userEvent.setup();
        (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
            if (url === '/items') {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve([
                            { id: '1', name: 'Buy milk', completed: false },
                        ]),
                });
            }

            return Promise.resolve({});
        });

        render(<TodoList />);

        await screen.findByText('Buy milk');
        await user.click(screen.getByRole('button', { name: 'Remove Item' }));

        await waitFor(() =>
            expect(screen.queryByText('Buy milk')).not.toBeInTheDocument(),
        );
        expect(
            screen.getByText('No items yet! Add one above!'),
        ).toBeInTheDocument();
    });
});
