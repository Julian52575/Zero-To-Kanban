# Project Deployment - Kubernetes packaging

- **Discussion:** [#123](https://github.com/Julian52575/Zero-To-Kanban/discussions/123)
- **Category:** Architecture Decision Records
- **Original poster:** @Julian52575
- **Opened:** 2026-09-18 07:48Z
- **Closed:** 2026-09-23 08:01Z

### Discussion

### Date

2026-09-18

### Context

We need a way to describe and template the app (backend, frontend, Postgres, ...) for Kubernetes so the same definition can be reused, with per-environment overrides, across dev and prod.
Routing also needs to mirror the existing docker-compose Traefik proxy (`/items` → backend, everything else → frontend) without requiring a Host() match or `/etc/hosts` entries, so the same chart works unmodified against a local rootless k3s node (which bundles its own Traefik and the IngressRoute CRD) as well as a shared cluster.

### Interrogation

- Should IngressRoute (Traefik CRD) stay the ingress mechanism, or should the chart also ship a standard Ingress resource for clusters without Traefik?
- Should the Postgres subchart's image track `bitnamilegacy/postgresql` now that `bitnami/postgresql` dropped versioned tags, or should the chart move to a different Postgres image/operator?

### Options

1. Raw Kubernetes manifests per environment — duplicate Deployment/Service/etc. YAML for dev and prod, no templating.
2. Kustomize — a base manifest set with dev/prod overlays.
3. Helm chart with per-environment values files — a single deployment/helm/zero-to-kanban chart with `values-dev.yaml/values-prod.yaml` overrides, the Bitnami postgresql chart as a dependency, and `templates/ingressroute.yaml` using Traefik's IngressRoute CRD.

### Decision

Accepted

### Branch

113-feature-deployment-configuration

### Justification

A single Helm chart parameterized by `values.yaml` plus environment overlays avoids duplicating k8s objects between dev/prod while keeping the diff explicit and small.
Postgres as the Bitnami subchart reuses a maintained chart and supports a dev-only generated Secret vs. a pre-created existingSecret in prod, so the plaintext password never passes through a Helm-rendered Secret in production. IngressRoute matches what's bundled with k3s and routes on path alone (no Host() match needed), mirroring the docker-compose Traefik proxy.

### Consequences -- Upside

- One chart, three consumers — drift limited to explicit overrides.
- No separate ingress controller needed against k3s.
- Prod's Postgres password never templated by Helm.

### Consequences -- Trade-offs and risks

- IngressRoute is Traefik-specific; not portable to ingress-nginx clusters without an added Ingress template.
- Bitnami's Aug 2025 catalog change forced pinning to bitnamilegacy/postgresql — ongoing external dependency risk.

### Impact size

Medium -- days

### References

_No response_

---
## Comments

#### @Julian52575 -- 2026-09-23 08:01Z

/commit

