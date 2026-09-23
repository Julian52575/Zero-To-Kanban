# GitOps delivery via Argo CD

- **Discussion:** [#126](https://github.com/Julian52575/Zero-To-Kanban/discussions/126)
- **Category:** Architecture Decision Records
- **Original poster:** @Julian52575
- **Opened:** 2026-09-18 14:47Z
- **Closed:** 2026-09-23 08:01Z

### Discussion

### Date

2026-09-18

### Context

With the app packaged as a Helm chart (see the Kubernetes packaging ADR #123), changes still need a defined path from a git commit to a running cluster, across at least two environments (dev, prod), without manual kubectl apply/helm upgrade steps drifting from what's in git, and without a change automatically reaching prod before it's been verified in dev.

### Interrogation

_No response_

### Options

1. Manual kubectl apply/helm upgrade per environment, no reconciliation loop.
2. Flux as the GitOps controller.
3. Argo CD, app-of-apps: `root-app.yaml` watches deployment/argocd/environments/, discovering one child Application per environment (`dev-app.yaml`, `prod-app.yaml`), each pointing at the same Helm chart with a different values overlay. Dev is auto-synced (`prune/selfHeal`); prod has no automated block — promotion is a deliberate manual sync.

### Decision

Accepted

### Branch

113-feature-deployment-configuration

### Justification

selfHeal means cluster state can't silently drift from git — a manual kubectl change to an Argo CD-managed resource gets reverted, unlike a one-off apply/upgrade.
App-of-apps means adding an environment is "add a file," not "wire a new pipeline." Dev auto-syncs for fast feedback; prod has no automated block, so promoting dev → prod is an explicit human action — the safety gate for the shared/production environment. `dev-k3s-app.yaml` is excluded from the root app's directory scan so a shared root Application can never accidentally bootstrap the local-k3s-only Application against the wrong cluster.

### Consequences -- Upside

- Cluster state can't drift from git undetected.
- Prod promotion is a single, explicit, auditable action.
- New environments are auto-discovered — just add a file.

### Consequences -- Trade-offs and risks

- Prod promotion still relies on a human remembering to sync it — no automated gate enforcing dev was verified first.
- Argo CD itself needs a manual, un-GitOps'd bootstrap into each cluster
- Three near-identical Applications (`dev-app.yaml`, `dev-k3s-app.yaml`, `dev-k3s-local-app.yaml`) for one functional environment adds duplication to keep straight as the team grows.

### Impact size

Medium -- days

### References

_No response_

---
## Comments

#### @Julian52575 -- 2026-09-23 08:01Z

/commit

