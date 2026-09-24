const {
    createTaskSchema,
    updateTaskSchema,
} = require('../../src/schemas/taskSchema');

describe('createTaskSchema', () => {
    const validTask = {
        projectId: 'project-1',
        name: 'Ma tâche',
        status: 'TODO',
        priority: 1,
        deadline: '2026-12-31',
    };

    describe('valid data', () => {
        it('should accept a valid task', () => {
            const result = createTaskSchema.safeParse(validTask);

            expect(result.success).toBe(true);
        });

        it('should accept TODO status', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                status: 'TODO',
            });

            expect(result.success).toBe(true);
        });

        it('should accept IN_PROGRESS status', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                status: 'IN_PROGRESS',
            });

            expect(result.success).toBe(true);
        });

        it('should accept DONE status', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                status: 'DONE',
            });

            expect(result.success).toBe(true);
        });

        it('should accept a null deadline', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                deadline: null,
            });

            expect(result.success).toBe(true);
        });

        it('should accept priority 0', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                priority: 0,
            });

            expect(result.success).toBe(true);
        });

        it('should accept a negative priority', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                priority: -10,
            });

            expect(result.success).toBe(true);
        });

        it('should accept a decimal priority', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                priority: 1.5,
            });

            expect(result.success).toBe(true);
        });

        it('should trim the task name', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: '   Ma tâche   ',
            });

            expect(result.success).toBe(true);
            expect(result.data.name).toBe('Ma tâche');
        });

        it('should trim the project ID', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                projectId: '   project-1   ',
            });

            expect(result.success).toBe(true);
            expect(result.data.projectId).toBe('project-1');
        });

        it('should trim the deadline', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                deadline: '   2026-12-31   ',
            });

            expect(result.success).toBe(true);
            expect(result.data.deadline).toBe('2026-12-31');
        });

        it('should accept a two-character name', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: 'AB',
            });

            expect(result.success).toBe(true);
        });

        it('should accept a 100-character name', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: 'A'.repeat(100),
            });

            expect(result.success).toBe(true);
        });
    });

    describe('name validation', () => {
        it('should reject a missing name', () => {
            const { name, ...task } = validTask;

            const result = createTaskSchema.safeParse(task);

            expect(result.success).toBe(false);
        });

        it('should reject a non-string name', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: 123,
            });

            expect(result.success).toBe(false);
        });

        it('should reject null name', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: null,
            });

            expect(result.success).toBe(false);
        });

        it('should reject an empty name', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: '',
            });

            expect(result.success).toBe(false);
        });

        it('should reject a name containing only spaces', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: '   ',
            });

            expect(result.success).toBe(false);
        });

        it('should reject a one-character name', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: 'A',
            });

            expect(result.success).toBe(false);
        });

        it('should reject a name longer than 100 characters', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                name: 'A'.repeat(101),
            });

            expect(result.success).toBe(false);
        });
    });

    describe('projectId validation', () => {
        it('should reject a missing projectId', () => {
            const { projectId, ...task } = validTask;

            const result = createTaskSchema.safeParse(task);

            expect(result.success).toBe(false);
        });

        it('should reject a non-string projectId', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                projectId: 123,
            });

            expect(result.success).toBe(false);
        });

        it('should reject null projectId', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                projectId: null,
            });

            expect(result.success).toBe(false);
        });

        it('should reject an empty projectId', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                projectId: '',
            });

            expect(result.success).toBe(false);
        });

        it('should reject a projectId containing only spaces', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                projectId: '   ',
            });

            expect(result.success).toBe(false);
        });
    });

    describe('status validation', () => {
        it('should reject a missing status', () => {
            const { status, ...task } = validTask;

            const result = createTaskSchema.safeParse(task);

            expect(result.success).toBe(false);
        });

        it('should reject an invalid status', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                status: 'INVALID',
            });

            expect(result.success).toBe(false);
        });

        it('should reject an empty status', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                status: '',
            });

            expect(result.success).toBe(false);
        });

        it('should reject a lowercase status', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                status: 'todo',
            });

            expect(result.success).toBe(false);
        });

        it('should reject a numeric status', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                status: 1,
            });

            expect(result.success).toBe(false);
        });

        it('should reject null status', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                status: null,
            });

            expect(result.success).toBe(false);
        });
    });

    describe('priority validation', () => {
        it('should reject a missing priority', () => {
            const { priority, ...task } = validTask;

            const result = createTaskSchema.safeParse(task);

            expect(result.success).toBe(false);
        });

        it('should reject a string priority', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                priority: '1',
            });

            expect(result.success).toBe(false);
        });

        it('should reject null priority', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                priority: null,
            });

            expect(result.success).toBe(false);
        });

        it('should reject boolean priority', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                priority: true,
            });

            expect(result.success).toBe(false);
        });
    });

    describe('deadline validation', () => {
        it('should reject a missing deadline', () => {
            const { deadline, ...task } = validTask;

            const result = createTaskSchema.safeParse(task);

            expect(result.success).toBe(false);
        });

        it('should reject a numeric deadline', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                deadline: 123,
            });

            expect(result.success).toBe(false);
        });

        it('should reject a boolean deadline', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                deadline: true,
            });

            expect(result.success).toBe(false);
        });

        it('should reject an empty deadline', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                deadline: '',
            });

            expect(result.success).toBe(false);
        });

        it('should reject a deadline containing only spaces', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                deadline: '   ',
            });

            expect(result.success).toBe(false);
        });
    });

    describe('object validation', () => {
        it('should reject null', () => {
            const result = createTaskSchema.safeParse(null);

            expect(result.success).toBe(false);
        });

        it('should reject an array', () => {
            const result = createTaskSchema.safeParse([]);

            expect(result.success).toBe(false);
        });

        it('should reject a number', () => {
            const result = createTaskSchema.safeParse(123);

            expect(result.success).toBe(false);
        });

        it('should reject a string', () => {
            const result = createTaskSchema.safeParse('task');

            expect(result.success).toBe(false);
        });

        it('should reject an unknown field', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                unknown: 'value',
            });

            expect(result.success).toBe(false);
        });

        it('should reject taskId in the creation body', () => {
            const result = createTaskSchema.safeParse({
                ...validTask,
                taskId: 'task-1',
            });

            expect(result.success).toBe(false);
        });
    });
});

describe('updateTaskSchema', () => {
    it('should accept a valid update', () => {
        const result = updateTaskSchema.safeParse({
            name: 'Updated task',
        });

        expect(result.success).toBe(true);
    });

    it('should accept an empty update object', () => {
        const result = updateTaskSchema.safeParse({});

        expect(result.success).toBe(true);
    });

    it('should accept a status update', () => {
        const result = updateTaskSchema.safeParse({
            status: 'DONE',
        });

        expect(result.success).toBe(true);
    });

    it('should accept a priority update', () => {
        const result = updateTaskSchema.safeParse({
            priority: 5,
        });

        expect(result.success).toBe(true);
    });

    it('should accept a null deadline update', () => {
        const result = updateTaskSchema.safeParse({
            deadline: null,
        });

        expect(result.success).toBe(true);
    });

    it('should reject an invalid name', () => {
        const result = updateTaskSchema.safeParse({
            name: '',
        });

        expect(result.success).toBe(false);
    });

    it('should reject an invalid status', () => {
        const result = updateTaskSchema.safeParse({
            status: 'INVALID',
        });

        expect(result.success).toBe(false);
    });

    it('should reject an invalid priority', () => {
        const result = updateTaskSchema.safeParse({
            priority: 'high',
        });

        expect(result.success).toBe(false);
    });

    it('should reject an invalid deadline', () => {
        const result = updateTaskSchema.safeParse({
            deadline: 123,
        });

        expect(result.success).toBe(false);
    });

    it('should reject an unknown field', () => {
        const result = updateTaskSchema.safeParse({
            unknown: 'value',
        });

        expect(result.success).toBe(false);
    });

    it('should reject null', () => {
        const result = updateTaskSchema.safeParse(null);

        expect(result.success).toBe(false);
    });

    it('should reject an array', () => {
        const result = updateTaskSchema.safeParse([]);

        expect(result.success).toBe(false);
    });
});