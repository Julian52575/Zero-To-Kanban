import { describe, test, expect, vi, beforeEach } from 'vitest';

const render = vi.fn();
const createRoot = vi.fn(() => ({ render }));

vi.mock('react-dom/client', () => ({
    default: { createRoot },
}));

vi.mock('./App', () => ({
    default: () => 'app-stub',
}));

describe('main', () => {
    beforeEach(() => {
        vi.resetModules();
        createRoot.mockClear();
        render.mockClear();
        document.body.innerHTML = '<div id="root"></div>';
    });

    test('mounts App into the #root element', async () => {
        await import('./main');

        expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
        expect(render).toHaveBeenCalledTimes(1);
    });
});
