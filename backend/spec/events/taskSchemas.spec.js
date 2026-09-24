const taskCreatedSchema = require('../../src/events/schemas/taskCreated');
const taskUpdatedSchema = require('../../src/events/schemas/taskUpdated');
const taskDeletedSchema = require('../../src/events/schemas/taskDeleted');
const taskStatusUpdatedSchema = require('../../src/events/schemas/taskStatusUpdated');
describe('Task event schemas', () => {
    const validTask = {
        taskId: 'task-1',
        name: 'Ma tâche',
        completed: false,
    };

    describe.each([
        ['taskCreatedSchema', taskCreatedSchema],
        ['taskUpdatedSchema', taskUpdatedSchema],
    ])('%s', (_, schema) => {
        it('should accept a valid task', () => {
            expect(schema.safeParse(validTask).success).toBe(true);
        });

        it('should accept a completed task', () => {
            expect(
                schema.safeParse({ ...validTask, completed: true }).success,
            ).toBe(true);
        });

        it.each(['taskId', 'name', 'completed'])(
            'should reject missing %s',
            (field) => {
                const { [field]: _omitted, ...data } = validTask;

                expect(schema.safeParse(data).success).toBe(false);
            },
        );

        it('should reject a non-string taskId', () => {
            expect(
                schema.safeParse({ ...validTask, taskId: 1 }).success,
            ).toBe(false);
        });

        it('should reject a non-boolean completed', () => {
            expect(
                schema.safeParse({ ...validTask, completed: 'yes' }).success,
            ).toBe(false);
        });
    });

    describe('taskDeletedSchema', () => {
        it('should accept a valid task deletion event', () => {
            const result = taskDeletedSchema.safeParse({
                taskId: 'task-1',
            });

            expect(result.success).toBe(true);
        });

        it('should reject missing taskId', () => {
            const result = taskDeletedSchema.safeParse({});

            expect(result.success).toBe(false);
        });

        it('should reject non-string taskId', () => {
            const result = taskDeletedSchema.safeParse({
                taskId: 123,
            });

            expect(result.success).toBe(false);
        });

        it('should reject null taskId', () => {
            const result = taskDeletedSchema.safeParse({
                taskId: null,
            });

            expect(result.success).toBe(false);
        });

        it('should reject unknown fields', () => {
            const result = taskDeletedSchema.safeParse({
                taskId: 'task-1',
                unknown: true,
            });

            expect(result.success).toBe(false);
        });

        it('should reject null', () => {
            const result = taskDeletedSchema.safeParse(null);

            expect(result.success).toBe(false);
        });

        it('should reject an array', () => {
            const result = taskDeletedSchema.safeParse([]);

            expect(result.success).toBe(false);
        });
    });

    describe('taskStatusUpdatedSchema', () => {
        const validStatusUpdate = {
            taskId: 'task-1',
            oldStatus: 'TODO',
            newStatus: 'IN_PROGRESS',
        };

        it('should accept a valid status update', () => {
            const result =
                taskStatusUpdatedSchema.safeParse(validStatusUpdate);

            expect(result.success).toBe(true);
        });

        it('should accept all valid old statuses', () => {
            for (const status of [
                'TODO',
                'IN_PROGRESS',
                'DONE',
            ]) {
                const result =
                    taskStatusUpdatedSchema.safeParse({
                        ...validStatusUpdate,
                        oldStatus: status,
                    });

                expect(result.success).toBe(true);
            }
        });

        it('should accept all valid new statuses', () => {
            for (const status of [
                'TODO',
                'IN_PROGRESS',
                'DONE',
            ]) {
                const result =
                    taskStatusUpdatedSchema.safeParse({
                        ...validStatusUpdate,
                        newStatus: status,
                    });

                expect(result.success).toBe(true);
            }
        });

        it('should reject missing taskId', () => {
            const result = taskStatusUpdatedSchema.safeParse({
                oldStatus: 'TODO',
                newStatus: 'DONE',
            });

            expect(result.success).toBe(false);
        });

        it('should reject invalid oldStatus', () => {
            const result =
                taskStatusUpdatedSchema.safeParse({
                    ...validStatusUpdate,
                    oldStatus: 'INVALID',
                });

            expect(result.success).toBe(false);
        });

        it('should reject invalid newStatus', () => {
            const result =
                taskStatusUpdatedSchema.safeParse({
                    ...validStatusUpdate,
                    newStatus: 'INVALID',
                });

            expect(result.success).toBe(false);
        });

        it('should reject numeric taskId', () => {
            const result =
                taskStatusUpdatedSchema.safeParse({
                    ...validStatusUpdate,
                    taskId: 123,
                });

            expect(result.success).toBe(false);
        });

        it('should reject null', () => {
            const result =
                taskStatusUpdatedSchema.safeParse(null);

            expect(result.success).toBe(false);
        });

        it('should reject unknown fields', () => {
            const result =
                taskStatusUpdatedSchema.safeParse({
                    ...validStatusUpdate,
                    unknown: true,
                });

            expect(result.success).toBe(false);
        });
    });
});