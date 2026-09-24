# Project CRUD

- **Discussion:** [#89](https://github.com/Julian52575/Zero-To-Kanban/discussions/89)
- **Category:** Architecture Decision Records
- **Original poster:** @Antoineweisse
- **Opened:** 2026-09-09 12:52Z
- **Closed:** 2026-09-24 12:50Z

### Discussion

### Date

09/09/2026

### Context

Implement the Project CRUD API to allow authenticated users to create, retrieve, update, and delete projects they are authorized to manage.

Each project must be associated with an owner, and all project operations must be protected by the application's authentication and authorization mechanisms.

The implementation should follow the backend architecture established in previous features:

Routes → Controllers → Services → Repositories → Prisma

The API must validate incoming data, enforce project ownership and authorization rules, and return appropriate HTTP responses for invalid or non-existent resources.

The initial API will expose the following endpoints:

POST   /projects       → Create project
GET    /projects       → Get user's projects
GET    /projects/:id   → Get one project
PUT    /projects/:id   → Update project
DELETE /projects/:id   → Delete project

### Options

- Layered CRUD architecture — Implement Projects using dedicated routes, controllers, services, and repositories. Controllers handle HTTP concerns, services contain business logic and authorization rules, and repositories handle persistence through Prisma. This follows the architecture already established by the backend.
- Direct controller-to-Prisma access — Allow controllers to interact directly with Prisma. This reduces the amount of code required for basic CRUD operations but mixes HTTP, business, and persistence concerns and makes the application harder to maintain and test.
- Generic CRUD abstraction — Introduce a generic CRUD service/repository shared across multiple resources. This could reduce duplicated code but adds abstraction that may not be justified at this stage and could make resource-specific authorization rules harder to express.

### Interrogation

How should Project CRUD operations be structured while ensuring that project ownership and authorization rules are consistently enforced ?

### Decision

Accepted

### Justification

Project CRUD operations will follow the existing backend architecture:

Routes
  ↓
Controllers
  ↓
Project Service
  ↓
Project Repository
  ↓
Prisma
  ↓
Database

Authentication will be enforced through the existing authentication middleware.

The Project Service will enforce authorization rules and ensure that users can only access or modify projects they are authorized to manage.

When a project is created, the authenticated user will be associated with the project as its owner.

Zod will be used to validate request parameters and request bodies at the API boundary.

The layered architecture provides a consistent structure across backend resources and clearly separates HTTP handling, business logic, authorization, and persistence.

Keeping project-specific business rules inside the Project Service prevents authorization logic from being duplicated across controllers or routes.

Associating projects with their authenticated owner at creation time also provides a clear basis for subsequent access-control checks.

The repository isolates Prisma-specific operations, making the persistence layer easier to modify or test independently from the rest of the application.

### Consequences -- Upside

- Provides a consistent architecture across backend resources.
- Clearly separates HTTP, business, authorization, and persistence concerns.
- Associates every project with an authenticated owner.
- Centralizes project authorization rules in the Project Service.
- Prevents users from accessing or modifying unauthorized projects.
- Provides consistent input validation through Zod.
- Makes CRUD operations easier to test and maintain.
- Provides a foundation for future project-level features such as task management and project members.

### Consequences -- Trade-offs and risks

- Introduces multiple layers for relatively simple CRUD operations.
- Requires authorization checks on every project-specific operation.
- Ownership and authorization rules must be carefully implemented to prevent unauthorized access.
- Changes to the Project model may require updates across multiple layers.
- Future support for project members or role-based access may require extending the current ownership-based authorization model.

### Impact size

Medium -- days

### References

- User Authentication
- User Authorization
- Project Prisma model
- Project Repository
- Project Service
- Project Controller
- Project CRUD API specification

---
## Comments

#### @Julian52575 -- 2026-09-24 12:43Z

Please set Decision to Accepted and close with comment: "/commit 43-61-merge-frontback"

#### @Antoineweisse -- 2026-09-24 12:47Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:50Z

/commit 43-61-merge-frontback

