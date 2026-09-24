const taskCreatedSchema = require('../../src/events/schemas/taskCreated');
const taskUpdatedSchema = require('../../src/events/schemas/taskUpdated');
const taskDeletedSchema = require('../../src/events/schemas/taskDeleted');
const taskStatusUpdatedSchema = require('../../src/events/schemas/taskStatusUpdated');
describe('Task event schemas', () => {
    const validTask = {
        taskId: 'task-1',
        projectId: 'project-1',
        name: 'Ma tâche',
        status: 'TODO',
        priority: 1,
        deadline: '2026-12-31',
    };

    describe('taskCreatedSchema', () => {
        it('should accept a valid task', () => {
            const result = taskCreatedSchema.safeParse(validTask);

            expect(result.success).toBe(true);
        });

        it('should accept null deadline', () => {
            const result = taskCreatedSchema.safeParse({
                ...validTask,
                deadline: null,
            });

            expect(result.success).toBe(true);
        });

        it('should accept all statuses', () => {
            for (const status of [
                'TODO',
                'IN_PROGRESS',
                'DONE',
            ]) {
                const result = taskCreatedSchema.safeParse({
                    ...validTask,
                    status,
                });

                expect(result.success).toBe(true);
            }
        });

        it('should reject missing taskId', () => {
            const { taskId, ...data } = validTask;

            expect(
                taskCreatedSchema.safeParse(data).success,
            ).toBe(false);
        });

        it('should reject missing projectId', () => {
            const { projectId, ...data } = validTask;

            expect(
                taskCreatedSchema.safeParse(data).success,
            ).toBe(false);
        });

        it('should reject missing name', () => {
            const { name, ...data } = validTask;

            expect(
                taskCreatedSchema.safeParse(data).success,
            ).toBe(false);
        });

        it('should reject invalid status', () => {
            expect(
                taskCreatedSchema.safeParse({
                    ...validTask,
                    status: 'INVALID',
                }).success,
            ).toBe(false);
        });

        it('should reject invalid priority', () => {
            expect(
                taskCreatedSchema.safeParse({
                    ...validTask,
                    priority: 'high',
                }).success,
            ).toBe(false);
        });

        it('should reject invalid deadline', () => {
            expect(
                taskCreatedSchema.safeParse({
                    ...validTask,
                    deadline: 123,
                }).success,
            ).toBe(false);
        });

        it('should reject unknown fields', () => {
            expect(
                taskCreatedSchema.safeParse({
                    ...validTask,
                    unknown: true,
                }).success,
            ).toBe(false);
        });
    });

    describe('taskUpdatedSchema', () => {
        it('should accept a valid task', () => {
            expect(
                taskUpdatedSchema.safeParse(validTask).success,
            ).toBe(true);
        });

        it('should accept null deadline', () => {
            expect(
                taskUpdatedSchema.safeParse({
                    ...validTask,
                    deadline: null,
                }).success,
            ).toBe(true);
        });

        it('should reject missing taskId', () => {
            const { taskId, ...data } = validTask;

            expect(
                taskUpdatedSchema.safeParse(data).success,
            ).toBe(false);
        });

        it('should reject missing projectId', () => {
            const { projectId, ...data } = validTask;

            expect(
                taskUpdatedSchema.safeParse(data).success,
            ).toBe(false);
        });

        it('should reject invalid status', () => {
            expect(
                taskUpdatedSchema.safeParse({
                    ...validTask,
                    status: 'INVALID',
                }).success,
            ).toBe(false);
        });

        it('should reject invalid priority', () => {
            expect(
                taskUpdatedSchema.safeParse({
                    ...validTask,
                    priority: '1',
                }).success,
            ).toBe(false);
        });

        it('should reject invalid deadline', () => {
            expect(
                taskUpdatedSchema.safeParse({
                    ...validTask,
                    deadline: 123,
                }).success,
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