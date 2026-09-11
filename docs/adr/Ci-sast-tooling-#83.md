# Ci sast tooling

- **Discussion:** [#83](https://github.com/Julian52575/Zero-To-Kanban/discussions/83)
- **Category:** Architecture Decision Records
- **Original poster:** @Julian52575
- **Opened:** 2026-09-09 07:51Z
- **Closed:** 2026-09-11 13:53Z

### Discussion

### Date

2026-09-09

### Context

There are no Integration, Quality nor Security tests/ analysis in the current CI workflow.
We have an abysmal OpenSSF score of 2.9.
A ci workflow that enforce code quality must be developed fast for the team to complete the migration PR, it will be kept simple until time can be dedicated to adding new tools.
A PR will not be accepted if these checks fails.
Checks will be done using local tools (`ci.yml`) and sast (`ci-sast.yml`)

### Options

I choose the following set of tools as the project's 1st quality gate:

1. SonarQube Cloud; due to previous experience and the many aspects it covers
2. CodeQL; a github tool easily wired
3. `npm audit`; dependencies vulnerabilities testable on our workers
4. Jest; run the already-present coverage tests 

### Interrogation

- What other tooling completes this set ?

### Decision

Accepted

### Justification

1. SonarQube Cloud check the following:
- Reliability
- Security and Security Hotspots
- Maintainability
- Coverage %
- Code Duplication %
2. CodeQL
- Vulnerability
- Security
3. `npm audit`
- Dependencies vulnerability
4. `jest`
- Coverage

### Consequences -- Upside

PRs hitting `main` are guaranteed to have a certain level of quality

### Consequences -- Trade-offs and risks

Team must dedicate time to build coverage tests and fix issues.

### Impact size

Small -- hours

### References

_No response_

---
## Comments

#### @Julian52575 -- 2026-09-10 12:16Z

This will be included into the #60 PR so team can use it directly

#### @Julian52575 -- 2026-09-11 13:51Z

/commit 59-split-frontend-and-backend

#### @Julian52575 -- 2026-09-11 13:53Z

/commit 59-split-frontend-and-backend

