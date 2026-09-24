# Task CRUD

- **Discussion:** [#88](https://github.com/Julian52575/Zero-To-Kanban/discussions/88)
- **Category:** Architecture Decision Records
- **Original poster:** @Antoineweisse
- **Opened:** 2026-09-09 12:49Z
- **Closed:** 2026-09-24 12:50Z

### Discussion

### Date

09/09/2026

### Context

Implement the Task CRUD API to allow authenticated users to create, retrieve, update, and delete tasks within projects they are authorized to access.

Tasks must always be associated with a project, and all operations must be protected by the application's authentication and authorization mechanisms.

The implementation should follow the existing layered backend architecture:

Routes → Controllers → Services → Repositories → Prisma → Database

The API must validate incoming data, enforce project-level authorization, and return appropriate HTTP responses for invalid or non-existent resources.

The initial API will expose the following endpoints:

POST   /projects/:projectId/tasks
GET    /projects/:projectId/tasks
GET    /projects/:projectId/tasks/:taskId
PUT    /projects/:projectId/tasks/:taskId
DELETE /projects/:projectId/tasks/:taskId

### Options

- Layered CRUD architecture — Implement Tasks using dedicated routes, controllers, services, and repositories. Controllers handle HTTP concerns, services contain business logic and authorization rules, and repositories handle persistence through Prisma. This follows the existing backend architecture and provides clear separation of responsibilities.
- Direct controller-to-Prisma access — Allow controllers to interact directly with Prisma. This reduces the amount of code required for a simple CRUD API but mixes HTTP, business, and persistence concerns and makes the application harder to maintain and test.
- Generic CRUD abstraction — Create a generic repository/service system shared by multiple resources. This can reduce duplication but introduces additional abstraction before the application's CRUD requirements are fully understood.

### Interrogation

How should Task CRUD operations be structured while maintaining separation between HTTP handling, business logic, authorization, and database access ?

### Decision

Accepted

### Justification

The layered architecture provides a clear separation of concerns and is consistent with the target backend architecture.

Controllers remain responsible for HTTP-specific concerns such as parsing requests and returning responses, while the Task Service contains business rules and authorization logic. The repository isolates database access from the rest of the application.

This structure also makes the individual layers easier to test and prevents Prisma/database logic from spreading throughout the application.

Keeping authorization in the service layer ensures that access rules are enforced regardless of which controller or route invokes the business operation.

### Consequences -- Upside

- Provides a clear separation of responsibilities.
- Keeps database access isolated inside the repository layer.
- Centralizes Task business logic in the Task Service.
- Makes authorization rules explicit and reusable.
- Provides consistent API validation through Zod.
- Makes the Task CRUD operations easier to test and maintain.
- Follows the intended backend architecture.
- Provides a foundation for adding future Task features such as status management and events.

### Consequences -- Trade-offs and risks

- Introduces more files and layers than a direct controller-to-Prisma implementation.
- Simple CRUD operations require passing through multiple layers.
- Authorization checks must be carefully implemented to prevent access to tasks belonging to unauthorized projects.
- The repository and service layers may initially contain relatively simple logic.
- Changes to the Task data model may require updates across several layers.

### Impact size

Medium -- days

### References

- User Authentication
- User Authorization
- Task Prisma model
- Task Repository
- Task Service
- Task Controller
- Task CRUD API specification

---
## Comments

#### @Julian52575 -- 2026-09-24 12:43Z

Please set Decision to Accepted and close with comment: "/commit 43-61-merge-frontback"

#### @Antoineweisse -- 2026-09-24 12:47Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:50Z

/commit 43-61-merge-frontback

