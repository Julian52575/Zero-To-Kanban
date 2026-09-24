const {
createItemSchema,
updateItemSchema,
} = require('../../src/schemas/itemSchema');

describe('createItemSchema', () => {
it('should accept a valid item name', () => {
const result = createItemSchema.safeParse({
name: 'Mon item',
});

    expect(result.success).toBe(true);
});

it('should reject a missing name', () => {
    const result = createItemSchema.safeParse({});

    expect(result.success).toBe(false);
});

it('should reject a non-string name', () => {
    const result = createItemSchema.safeParse({
        name: 123,
    });

    expect(result.success).toBe(false);
});

it('should reject an empty name', () => {
    const result = createItemSchema.safeParse({
        name: '',
    });

    expect(result.success).toBe(false);
});

it('should reject a name containing only spaces', () => {
    const result = createItemSchema.safeParse({
        name: '   ',
    });

    expect(result.success).toBe(false);
});

it('should trim the item name', () => {
    const result = createItemSchema.safeParse({
        name: '  Mon item  ',
    });

    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Mon item');
});

it('should reject a name shorter than 2 characters', () => {
    const result = createItemSchema.safeParse({
        name: 'A',
    });

    expect(result.success).toBe(false);
});

it('should accept a name with exactly 2 characters', () => {
    const result = createItemSchema.safeParse({
        name: 'AB',
    });

    expect(result.success).toBe(true);
});

it('should accept a name with exactly 100 characters', () => {
    const result = createItemSchema.safeParse({
        name: 'A'.repeat(100),
    });

    expect(result.success).toBe(true);
});

it('should reject a name longer than 100 characters', () => {
    const result = createItemSchema.safeParse({
        name: 'A'.repeat(101),
    });

    expect(result.success).toBe(false);
});

it('should reject unknown fields', () => {
    const result = createItemSchema.safeParse({
        name: 'Mon item',
        unknown: 'value',
    });

    expect(result.success).toBe(false);
});

it('should reject completed during item creation', () => {
    const result = createItemSchema.safeParse({
        name: 'Mon item',
        completed: true,
    });

    expect(result.success).toBe(false);
});

it('should reject null as item data', () => {
    const result = createItemSchema.safeParse(null);

    expect(result.success).toBe(false);
});

it('should reject an array as item data', () => {
    const result = createItemSchema.safeParse([]);

    expect(result.success).toBe(false);
});

it('should reject a number as item data', () => {
    const result = createItemSchema.safeParse(123);

    expect(result.success).toBe(false);
});

});

describe('updateItemSchema', () => {
it('should accept a valid item name', () => {
const result = updateItemSchema.safeParse({
name: 'Mon item',
});

    expect(result.success).toBe(true);
});

it('should accept a valid completed value', () => {
    const result = updateItemSchema.safeParse({
        completed: true,
    });

    expect(result.success).toBe(true);
});

it('should accept false as a valid completed value', () => {
    const result = updateItemSchema.safeParse({
        completed: false,
    });

    expect(result.success).toBe(true);
});

it('should accept both name and completed', () => {
    const result = updateItemSchema.safeParse({
        name: 'Mon item',
        completed: true,
    });

    expect(result.success).toBe(true);
});

it('should accept an empty update', () => {
    const result = updateItemSchema.safeParse({});

    expect(result.success).toBe(true);
});

it('should trim the item name', () => {
    const result = updateItemSchema.safeParse({
        name: '  Mon item  ',
    });

    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Mon item');
});

it('should reject a non-string name', () => {
    const result = updateItemSchema.safeParse({
        name: 123,
    });

    expect(result.success).toBe(false);
});

it('should reject an empty name', () => {
    const result = updateItemSchema.safeParse({
        name: '',
    });

    expect(result.success).toBe(false);
});

it('should reject a name containing only spaces', () => {
    const result = updateItemSchema.safeParse({
        name: '   ',
    });

    expect(result.success).toBe(false);
});

it('should reject a name shorter than 2 characters', () => {
    const result = updateItemSchema.safeParse({
        name: 'A',
    });

    expect(result.success).toBe(false);
});

it('should accept a name with exactly 2 characters', () => {
    const result = updateItemSchema.safeParse({
        name: 'AB',
    });

    expect(result.success).toBe(true);
});

it('should accept a name with exactly 100 characters', () => {
    const result = updateItemSchema.safeParse({
        name: 'A'.repeat(100),
    });

    expect(result.success).toBe(true);
});

it('should reject a name longer than 100 characters', () => {
    const result = updateItemSchema.safeParse({
        name: 'A'.repeat(101),
    });

    expect(result.success).toBe(false);
});

it('should reject a non-boolean completed value', () => {
    const result = updateItemSchema.safeParse({
        completed: 'true',
    });

    expect(result.success).toBe(false);
});

it('should reject a numeric completed value', () => {
    const result = updateItemSchema.safeParse({
        completed: 1,
    });

    expect(result.success).toBe(false);
});

it('should reject unknown fields', () => {
    const result = updateItemSchema.safeParse({
        name: 'Mon item',
        unknown: 'value',
    });

    expect(result.success).toBe(false);
});

it('should reject null as item data', () => {
    const result = updateItemSchema.safeParse(null);

    expect(result.success).toBe(false);
});

it('should reject an array as item data', () => {
    const result = updateItemSchema.safeParse([]);

    expect(result.success).toBe(false);
});

it('should reject a number as item data', () => {
    const result = updateItemSchema.safeParse(123);

    expect(result.success).toBe(false);
});

});