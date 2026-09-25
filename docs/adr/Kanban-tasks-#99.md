# Kanban tasks

- **Discussion:** [#99](https://github.com/Julian52575/Zero-To-Kanban/discussions/99)
- **Category:** Architecture Decision Records
- **Original poster:** @Antoineweisse
- **Opened:** 2026-09-10 17:58Z
- **Closed:** 2026-09-24 12:49Z

### Discussion

### Date

10/09/2026

### Context

The current Task model is limited to a title and a completion checkbox. This is sufficient for a basic todo list but does not provide enough information to properly represent tasks in a Kanban application.

Tasks need additional information to support planning, organization, and task relationships.

The initial required properties are:

- Title
- Description
- Start date
- Due date
- Parent task

The parent task allows a task to reference another task directly, creating a simple task hierarchy.

### Options

- Add the required fields directly to the existing Task entity. This keeps the current model simple while providing the additional information required by the Kanban.
- Create separate entities for task descriptions, dates, and relationships. This would provide more flexibility but would unnecessarily increase the complexity of a relatively simple task model.
- Store additional task properties in a JSON field. This would make the model flexible but would reduce type safety, database constraints, and queryability.

### Interrogation

The main question is how much information should be included in the base Task model.

The requested properties are fundamental task attributes rather than optional extensions. They should therefore be represented explicitly in the relational model.

The parent relationship also needs to be modeled as a self-referencing relationship rather than storing an arbitrary value, allowing the database to maintain a direct relationship between tasks.

### Decision

Accepted

### Justification

The resulting model will contain at least:

Task
├── id
├── title
├── description
├── startDate
├── dueDate
└── parentId → Task.id

The fields should follow these rules:

title — required
description — optional
startDate — optional
dueDate — optional
parentId — optional

A task without a parent is considered a root task.

Task A
├── Task B
│   └── Task D
└── Task C

The relationship should be implemented as a self-relation in Prisma, allowing tasks to reference other tasks directly.

Date validation should ensure that invalid relationships between dates are rejected where appropriate, such as a due date occurring before the start date.

These fields represent core information required by a Kanban task and should therefore be part of the main Task model.

Keeping them directly on the entity provides:

Simple queries
Strong typing
Database-level relationships
Straightforward CRUD operations
Easy integration with task filtering

The self-referencing parentId also provides a simple foundation for task hierarchies without introducing a separate hierarchy entity.

Additional task properties such as priority, labels, or attachments can be introduced independently as future features.

### Consequences -- Upside

- Tasks contain enough information for Kanban usage
- Task descriptions provide additional context
- Start and due dates enable planning and filtering
- Parent tasks allow task hierarchies
- Data remains strongly typed and queryable
- Integrates directly with the existing Task CRUD
- Provides a foundation for future Kanban features

### Consequences -- Trade-offs and risks

- The Task model becomes more complex than the original todo model
- Date validation must be handled consistently
- Parent-child relationships require additional queries
- Deleting a parent task requires a defined behavior for its children
- Deep task hierarchies may require additional handling in the frontend

### Impact size

Tiny -- minutes

### References

- [New Database Schema] — Defines the relational domain model.
- [Task CRUD] — Defines the CRUD operations that must support the extended Task entity.
- [Filter Tasks] — Uses start date, due date, and parent task as filtering criteria.
- [Task Labeling] — Adds labels as an additional task categorization mechanism.

---
## Comments

#### @Julian52575 -- 2026-09-24 12:43Z

Please set Decision to Accepted and close with comment: "/commit 43-61-merge-frontback"

#### @Antoineweisse -- 2026-09-24 12:47Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:49Z

/commit 43-61-merge-frontback

