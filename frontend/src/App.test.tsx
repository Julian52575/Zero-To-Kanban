import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./components/TodoList', () => ({
    default: () => <div>todo-list-stub</div>,
}));

import App from './App';

describe('App', () => {
    test('renders the todo list', () => {
        render(<App />);

        expect(screen.getByText('todo-list-stub')).toBeInTheDocument();
    });
});
