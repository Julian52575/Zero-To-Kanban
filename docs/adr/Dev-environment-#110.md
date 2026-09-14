# Dev environment

- **Discussion:** [#110](https://github.com/Julian52575/Zero-To-Kanban/discussions/110)
- **Category:** Architecture Decision Records
- **Original poster:** @Julian52575
- **Opened:** 2026-09-11 14:27Z
- **Closed:** 2026-09-11 14:35Z

### Discussion

### Date

2026-09-11

### Context

**This document was written after the CI was implemented, no ADR process was present at the time and the team needed these changes on #60**

Without a solid dev environment, friction occurs when different team members and ci/cd workers must coordinate their system packages (ie: `pqsl, just, docker`) to this single project. 
Headaches can also occur when sharing long/complex command that are often ran (ie: dumping the database before deleting the whole docker-compose).

### Interrogation

_No response_

### Options

1. Leave everything as is: hope all front, back, devops and worker remember every commonly-used commands (not recommanded)
2. Create a `justfile` and `just` recipies as shortcut for commonly-used commands with added checks
3. Use `flake.nix` (and resulting `flake.lock`) to define a reproductible dev environment
4. Wrap the multiple application services under a `docker-compose` that all have their own sub-system (images)

Use my [repostiory template](https://github.com/Julian52575/Big-3-Governed-Template) that handles options 2-4 as a base to improve on.

### Decision

Accepted

### Branch

59-split-frontend-and-backend

### Justification

2. Team members do not have to remember each command, with the added benefit that checks and updates can be performed on every shortcut without affecting their usage.
3. A reproductible dev environment connects all team member and ci/cd workers under the same shell, dependencies version and environment variables.
By depending of a tracked file (here, descriptive `flake.nix` and resulting `flake.lock` as well as `), anyone can work on the app the same way.
4. Every microservice running under their unique sub-system ensure no leakage. It is much easier to start, restart, delete and query these isolated services than if it was locally.

### Consequences -- Upside

This strong connection under the same dev environment greatly improve communication and reduce friction.

### Consequences -- Trade-offs and risks

N/A

### Impact size

Medium -- days

### References

1. https://github.com/Julian52575/Big-3-Governed-Template

---
## Comments

_No comments._

