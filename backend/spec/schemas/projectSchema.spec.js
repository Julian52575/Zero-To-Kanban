const { createProjectSchema } = require('../../src/schemas/projectSchema');

describe('createProjectSchema', () => {
    it('should accept a valid project name', () => {
        const result = createProjectSchema.safeParse({
            name: 'Mon projet',
        });

        expect(result.success).toBe(true);
    });

    it('should reject a missing name', () => {
        const result = createProjectSchema.safeParse({});

        expect(result.success).toBe(false);
    });

    it('should reject a non-string name', () => {
        const result = createProjectSchema.safeParse({
            name: 123,
        });

        expect(result.success).toBe(false);
    });

    it('should reject an empty name', () => {
        const result = createProjectSchema.safeParse({
            name: '',
        });

        expect(result.success).toBe(false);
    });

    it('should reject a name containing only spaces', () => {
        const result = createProjectSchema.safeParse({
            name: '   ',
        });

        expect(result.success).toBe(false);
    });

    it('should trim the project name', () => {
        const result = createProjectSchema.safeParse({
            name: '  Mon projet  ',
        });

        expect(result.success).toBe(true);
        expect(result.data.name).toBe('Mon projet');
    });

    it('should reject a name shorter than 2 characters', () => {
        const result = createProjectSchema.safeParse({
            name: 'A',
        });

        expect(result.success).toBe(false);
    });

    it('should reject a name longer than 100 characters', () => {
        const result = createProjectSchema.safeParse({
            name: 'A'.repeat(101),
        });

        expect(result.success).toBe(false);
    });

    it('should reject unknown fields', () => {
        const result = createProjectSchema.safeParse({
            name: 'Mon projet',
            unknown: 'value',
        });

        expect(result.success).toBe(false);
    });

    it('should reject null as project data', () => {
        const result = createProjectSchema.safeParse(null);

        expect(result.success).toBe(false);
    });

    it('should reject an array as project data', () => {
        const result = createProjectSchema.safeParse([]);

        expect(result.success).toBe(false);
    });

    it('should reject a number as project data', () => {
        const result = createProjectSchema.safeParse(123);

        expect(result.success).toBe(false);
    });
});