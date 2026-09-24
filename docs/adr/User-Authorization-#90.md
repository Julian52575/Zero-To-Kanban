# User Authorization

- **Discussion:** [#90](https://github.com/Julian52575/Zero-To-Kanban/discussions/90)
- **Category:** Architecture Decision Records
- **Original poster:** @Antoineweisse
- **Opened:** 2026-09-09 12:58Z
- **Closed:** 2026-09-24 12:49Z

### Discussion

### Date

09/09/2026

### Context

Implement an authorization layer to ensure that authenticated users can only access and modify resources they are authorized to use.

Authentication establishes the identity of the user, but does not determine what that user is allowed to access. The authorization layer must therefore use the authenticated user identity provided by the authentication system and verify access rights before performing operations on protected resources.

The initial authorization model will focus on projects and tasks:

Users can access and manage their own projects.
Tasks can only be accessed or modified through projects the user is authorized to access.
Resources belonging to another user must not be accessible or modifiable unless the user has explicit access rights.

Authorization must be enforced on the backend so that clients cannot bypass access restrictions by directly calling the API.

### Options

- Service-level authorization — Perform authorization checks inside the relevant service layer before executing business operations. This keeps authorization close to the business rules and allows checks to be reused by different controllers or entry points.
- Authorization middleware — Perform authorization checks through dedicated middleware before requests reach the service layer. This can simplify controllers but may become difficult to manage when authorization depends on resource-specific business rules or database state.
- Controller-level authorization — Perform authorization checks directly inside controllers before calling services. This is simple for small applications but can lead to duplicated authorization logic across endpoints and makes the rules harder to maintain consistently.
- Hybrid approach — Use middleware for general authentication/context handling and service-level checks for resource-specific authorization. This separates authentication concerns from business authorization rules while avoiding duplication.

### Interrogation

Where should authorization checks be implemented so that resource access rules remain centralized, reusable, and consistently enforced across the API ?

### Decision

Accepted

### Justification

The existing authentication mechanism will provide the authenticated user's identity through the request context.

General authentication will be handled by the existing authentication middleware, while resource-specific authorization will be handled by the relevant service layer.

The authorization flow will therefore be:

Request
   ↓
Authentication Middleware
   ↓
Authenticated User
   ↓
Controller
   ↓
Service
   ↓
Authorization Check
   ↓
Repository
   ↓
Database

For project operations, the Project Service will verify that the authenticated user owns or otherwise has access to the requested project.

For task operations, the Task Service will verify that the user has access to the project associated with the task before allowing the operation.

Authorization checks must occur before performing the requested modification or returning protected resource data.

Authentication and authorization have different responsibilities and should remain separate.

The authentication middleware only establishes who the user is, while the service layer determines what that user is allowed to do.

Resource authorization often requires access to application data. For example, determining whether a user can modify a task requires knowing which project the task belongs to and whether the user has access to that project.

Keeping these rules in the service layer allows the authorization logic to remain close to the business rules and prevents controllers from becoming responsible for resource-level access decisions.

A hybrid approach also allows common authentication logic to remain in middleware while keeping resource-specific authorization centralized within the corresponding services.

### Consequences -- Upside

- Clearly separates authentication from authorization.
- Ensures authorization is enforced on the backend.
- Centralizes resource-specific access rules in the service layer.
- Prevents users from accessing or modifying unauthorized projects and tasks.
- Allows authorization checks to be reused by multiple API endpoints.
- Keeps controllers focused on HTTP-related responsibilities.
- Provides a foundation for future role-based or project-member permissions.
- Makes the authorization model easier to test independently from HTTP routes.

### Consequences -- Trade-offs and risks

- Resource authorization may require additional database queries to determine ownership or access rights.
- Every protected service operation must ensure that authorization is checked before accessing or modifying the resource.
- Incorrect or missing authorization checks could result in unauthorized data access.
- The initial ownership-based model may need to be extended when project members, roles, or permissions are introduced.
- Some authorization checks may become more complex as the application's resource hierarchy grows.

### Impact size

Medium -- days

### References

- User Authentication
- Project CRUD
- Task CRUD
- Project Authorization Rules
- Task Authorization Rules

---
## Comments

#### @Julian52575 -- 2026-09-24 12:43Z

Please set Decision to Accepted and close with comment: "/commit 43-61-merge-frontback"

#### @Antoineweisse -- 2026-09-24 12:47Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:49Z

/commit 43-61-merge-frontback

