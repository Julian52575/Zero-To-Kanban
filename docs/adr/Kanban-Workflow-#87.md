# Kanban Workflow

- **Discussion:** [#87](https://github.com/Julian52575/Zero-To-Kanban/discussions/87)
- **Category:** Architecture Decision Records
- **Original poster:** @Antoineweisse
- **Opened:** 2026-09-09 12:45Z
- **Closed:** 2026-09-24 12:51Z

### Discussion

### Date

09/09/2026

### Context

Introduce the basic Kanban workflow for tasks by allowing authorized users to move tasks between predefined workflow states.

The task status must be managed and validated by the backend to ensure that the application remains consistent regardless of the client consuming the API.

Only authenticated and authorized users should be able to modify the status of tasks belonging to projects they can access.

The initial workflow consists of three statuses:

- TODO
- IN_PROGRESS
- DONE

The implementation also requires persistence at the database level, status validation, repository support, service-layer business logic, and an API endpoint for status updates.

### Options

- Backend-managed status with a fixed set of statuses — Define the allowed statuses in the Prisma model and validate incoming values with Zod. Business rules are enforced by the service layer. This provides a simple and consistent foundation for the initial Kanban workflow.
- Frontend-managed status — Allow the frontend to determine and validate task statuses before sending them to the backend. This is simpler on the client side but cannot guarantee data integrity and would allow other API consumers to bypass the workflow rules.
- Flexible/custom workflow statuses — Store statuses as configurable project-level data rather than a fixed enum. This would provide greater flexibility but introduces additional data modeling and business logic that is not required for the initial Kanban implementation.

### Interrogation

Should task statuses be defined as a fixed backend-managed workflow, or should the system support configurable workflow states from the beginning?

### Decision

Accepted

### Justification

The initial Kanban workflow only requires a small, well-defined set of statuses. A fixed backend-managed workflow provides strong data consistency while keeping the implementation simple.

Keeping the status rules in the backend prevents clients from bypassing business constraints and ensures that all API consumers follow the same workflow.

Using a Prisma enum also provides database-level constraints and type safety, while Zod provides validation at the API boundary.

A configurable workflow can be introduced later if the application requires project-specific statuses or more complex Kanban workflows.

### Consequences -- Upside

- Provides a consistent task workflow across all clients.
- Keeps business rules and validation on the backend.
- Prevents unauthorized users from modifying task status.
- Provides database-level type safety through Prisma.
- Allows the frontend to reliably display tasks as Kanban columns.
- Keeps the initial implementation simple and easy to extend.
- Provides a clear foundation for future status-related features and events such as TaskStatusChanged.

### Consequences -- Trade-offs and risks

- The initial workflow is limited to three predefined statuses.
- Adding or changing statuses requires a backend/database change.
- More complex project-specific workflows will require additional modeling later.
- Status transition rules may become more complex as business requirements evolve.
- Authorization checks must remain consistent with the project's existing access-control model.

### Impact size

Medium -- days

### References

- Kanban Workflow technical specification
- Task Service
- Task Prisma model
- Task repository
- Authentication and authorization layer

---
## Comments

#### @Julian52575 -- 2026-09-24 12:43Z

Please set Decision to Accepted and close with comment: "/commit 43-61-merge-frontback"

#### @Antoineweisse -- 2026-09-24 12:48Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:50Z

/commit 43-61-merge-frontback

