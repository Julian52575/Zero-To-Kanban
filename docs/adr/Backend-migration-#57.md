# Backend migration

- **Discussion:** [#57](https://github.com/Julian52575/Zero-To-Kanban/discussions/57)
- **Category:** Architecture Decision Records
- **Original poster:** @Julian52575
- **Opened:** 2026-09-04 20:18Z
- **Closed:** 2026-09-11 21:48Z

### Discussion

### Date

2026-09-04

### Context

The current backend (`src/`) mixes frontend and backend responsibilities: Express serves the frontend directly from `src/static/` via `express.static()`, routes handle HTTP requests and call persistence directly, and `mysql.js`/`sqlite.js` duplicate almost the same CRUD logic.
The data model is minimal (`todo_items` with only `id`, `name`, `completed`), while the target Kanban application needs users, projects, tasks, workflow, priorities and deadlines.
There is no dedicated input validation layer, no centralized error middleware (404s aren't explicitly handled on update/delete), no authentication/authorization, and no event-driven mechanism.
Deployment is currently one grouped application, and CI "needs improvement" rather than testing/building frontend and backend separately.
The project's stated goals (separation of responsibilities, APIs, security, testability, maintainability, deployment/automation, event-driven communication) and Sprint 1's specific requirement to define and implement the target architecture along with the CI and event-driven foundations require addressing this.

### Options

1. **Keep the current architecture** — backend and frontend remain coupled through `express.static()`, persistence stays split/duplicated between `sqlite.js` and `mysql.js` with tables created ad hoc at startup, and the data model stays limited to `todo_items`.
2. **Adopt the proposed separated architecture**:
   - Split the repository into `frontend/` and `backend/`, each with its own `package.json`, source, and build/test scripts.
   - Backend: remove the `src/static/` coupling, split `app.js` (Express app creation) from `server.js` (server start), layer the backend as Route → Controller → Service → Repository → Prisma → Database, add validation/authentication middleware, centralized error handling, and CORS if frontend/backend run on different origins.
   - Frontend: move `src/static/` into `frontend/`, communicate with the backend only via a REST API, and configure the backend URL through an environment variable.
   - Database: run the database as its own service (Docker Compose), connect via a `DATABASE_URL`-style configuration variable, and replace ad hoc SQL table creation with a versioned `prisma/schema.prisma` plus Prisma Migrate.
   - Data model: introduce `User`, `Project`, `Task`, `TaskStatus`/`KanbanColumn`, `Priority`, and `Deadline` entities, with relationships/constraints defined in `schema.prisma` (exact model to be validated with the functional team).
   - Database technology: PostgreSQL or MySQL, to be decided by the team (the project currently supports SQLite and MySQL).
   - CI/Deployment: move from one grouped CI/deployment to separate frontend and backend test/build pipelines and independently deployable services.

### Decision

Accepted

### Justification

Separating frontend and backend lets each evolve, test, build and deploy independently, with Docker images per service if chosen. Removing the `src/static/` coupling and layering the backend (Controller → Service → Repository → Prisma) isolates business logic from persistence and prevents routes from concentrating all responsibilities.
Migrating persistence to Prisma centralizes model definitions in `schema.prisma`, replaces duplicate SQLite/MySQL CRUD code, and produces versioned, reproducible migrations usable across development, test, CI and production. This is not simply swapping SQLite/MySQL for Prisma — the real objective is separating responsibilities and progressively evolving the data model with reproducible, testable, versioned migrations that support the Kanban functionality (users, projects, tasks, workflow, priorities, deadlines).
Note that `schema.prisma` (which describes models and relationships) and the generated SQL migration files are not the same thing — Prisma uses the schema to generate the client and to produce/apply the versioned migrations.

### Consequences

- Frontend and backend become independently deployable services communicating only via HTTP API; CORS configuration becomes necessary once they run on different origins.
- The backend no longer depends on frontend static files to function; business logic is isolated from the database and persistence is centralized behind Repository → Prisma.
- Schema changes become versioned and reproducible via Prisma Migrate instead of `CREATE TABLE` statements run at startup.
- The database becomes a separate service requiring its own Docker/CI configuration and a `DATABASE_URL`-style connection setting; PostgreSQL vs MySQL (or another engine) still needs to be decided by the team.
- The exact data model (User/Project/Task/Kanban/priorities/deadlines relationships and constraints) still needs validation by the functional team.
- To limit regressions, the migration should proceed in small, tested, documented pull requests. Two orderings are given:
  - **General steps**: create `frontend/` and `backend/` without changing functional behavior → make the frontend work with the backend only via API → move the database into its own service with externalized connection config → introduce Prisma/`schema.prisma` and the first migrations → gradually migrate CRUD operations to Prisma repositories → build out the DB schema for User/Project/Task/Kanban → add validation, error handling, authentication/authorization and events → adapt CI/CD to test/build frontend and backend separately and publish Docker images.
  - **Detailed phase breakdown**: (P0) separate frontend/backend and remove the `src/static/` coupling; (P1) restructure the backend into `app.js`/`server.js` + `routes/`, `controllers/`, `services/`, `repositories/` with centralized error handling; (P2) introduce Prisma and the first migrations; (P3) evolve the data model to User/Project/Task/Kanban; (P4) add validation, authentication, authorization, HTTP error handling; (P5) add the event-driven mechanism, demonstrated end-to-end (e.g. `TaskCreated` → notification); (P6) strengthen testing, quality, CI, Docker and artifact/image publishing; (P7) stabilize and document deployment, complete CD if selected.

### Impact size

Large -- weeks, needs breaking down

### References

Files affected in the current backend:
- `src/index.js`
- `src/routes/addItem.js`, `src/routes/deleteItem.js`, `src/routes/getItems.js`, `src/routes/updateItem.js`
- `src/persistence/index.js`, `src/persistence/mysql.js`, `src/persistence/sqlite.js`
- `src/static/` (frontend, to be relocated)

---
## Comments

#### @Julian52575 -- 2026-09-11 14:36Z

@Antoineweisse Does this need further work ?

> **@Antoineweisse** -- 2026-09-11 17:04Z
>
> Valid. The proposed architecture is sufficiently detailed and addresses the current architectural issues, target requirements, migration strategy, CI/CD and event-driven foundations. The remaining open points (database choice and exact functional data model) are intentionally left for team validation rather than being architectural blockers.

#### @Julian52575 -- 2026-09-11 21:45Z

/commit 59-split-frontend-and-backend

#### @Julian52575 -- 2026-09-11 21:48Z

/commit 59-split-frontend-and-backend

