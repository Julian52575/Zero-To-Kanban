const http = require('http');

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../src/repositories/itemRepository', () => ({
    getAll: jest.fn(),
    create: jest.fn(),
    deleteById: jest.fn(),
    updateById: jest.fn(),
    getById: jest.fn(),
}));

const itemRepository = require('../src/repositories/itemRepository');
const app = require('../src/app');

let server;
let baseUrl;

beforeAll((done) => {
    server = http.createServer(app).listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        done();
    });
});

afterAll((done) => {
    server.close(done);
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('disables the x-powered-by header', async () => {
    itemRepository.getAll.mockResolvedValue([]);

    const res = await fetch(`${baseUrl}/items`);

    expect(res.headers.get('x-powered-by')).toBeNull();
});

test('GET /items lists items', async () => {
    const items = [{ id: '1', name: 'Task 1', completed: false }];
    itemRepository.getAll.mockResolvedValue(items);

    const res = await fetch(`${baseUrl}/items`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(items);
});

test('POST /items creates an item from a JSON body', async () => {
    const created = { id: '1', name: 'New task', completed: false };
    itemRepository.create.mockResolvedValue(created);

    const res = await fetch(`${baseUrl}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New task' }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(created);
});

test('PUT /items/:id updates an item', async () => {
    const updated = { id: '1', name: 'Updated', completed: true };
    itemRepository.updateById.mockResolvedValue();
    itemRepository.getById.mockResolvedValue(updated);

    const res = await fetch(`${baseUrl}/items/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated', completed: true }),
    });
    const body = await res.json();

    expect(itemRepository.updateById).toHaveBeenCalledWith('1', {
        name: 'Updated',
        completed: true,
    });
    expect(body).toEqual(updated);
});

test('DELETE /items/:id deletes an item', async () => {
    itemRepository.deleteById.mockResolvedValue();

    const res = await fetch(`${baseUrl}/items/1`, { method: 'DELETE' });

    expect(itemRepository.deleteById).toHaveBeenCalledWith('1');
    expect(res.status).toBe(200);
});
