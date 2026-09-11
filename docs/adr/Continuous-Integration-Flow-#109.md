# Continuous Integration Flow

- **Discussion:** [#109](https://github.com/Julian52575/Zero-To-Kanban/discussions/109)
- **Category:** Architecture Decision Records
- **Original poster:** @Julian52575
- **Opened:** 2026-09-11 14:04Z
- **Closed:** 2026-09-11 14:04Z

### Discussion

### Date

2026-09-11

### Context

**This document was written after the CI was implemented, no ADR process was present at the time and the team needed these on #60 **

To ensure no regression occur on the project after each push to `main`, tests must be ran and gate code until the passes.
The test suite includes:
- devshell: ensure the devshell is still accessible
- backend: run unit tests, migrate database, ping API
- frontend: lint, build, ping service
- database: run `pg_isready`
- Also, run a vulnerability audit on the dependencies used

Every single test must succeed for a PR to hit `main`.

Sast checks are also included, **see #83**.

### Interrogation

_No response_

### Decision

Accepted

### Branch

59-split-frontend-and-backend

### Justification

Catching regression before-hand save debugging time and ensure product quality.

### Consequences -- Upside

- Issues are quickly and automatically caught before-hand
- Quality of code is ensured
- The test suite is easily scalable 

### Consequences -- Trade-offs and risks

Team must spend extra time on a feature to make it ci-compliant

### Impact size

Small -- hours

### References

_No response_

---
## Comments

#### @Julian52575 -- 2026-09-11 14:04Z

/commit 59-split-frontend-and-backend

