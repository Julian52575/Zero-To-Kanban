const { validateUsername, safeNext } = require('../src/validation');

describe('validateUsername', () => {
    test('trims and lower-cases a valid username', () => {
        expect(validateUsername('  Ada_Lovelace ')).toEqual({ username: 'ada_lovelace' });
    });

    test.each([
        ['no', 'too short'],
        ['a'.repeat(33), 'too long'],
        ['has spaces', 'illegal char'],
        ['bad!', 'illegal char'],
        [42, 'not a string'],
        [undefined, 'missing'],
    ])('rejects %p (%s)', (input) => {
        expect(validateUsername(input)).toHaveProperty('error');
    });
});

describe('safeNext', () => {
    test.each([
        ['/board', '/board'],
        ['/', '/'],
        ['//evil.example', '/'],
        ['https://evil.example', '/'],
        ['not-a-path', '/'],
        [undefined, '/'],
    ])('safeNext(%p) -> %p', (input, expected) => {
        expect(safeNext(input)).toBe(expected);
    });
});
