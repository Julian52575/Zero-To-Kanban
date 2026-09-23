# deployment/

Kubernetes deployment for Zero To Kanban: a Helm chart, Argo CD Applications
that deploy it, and a Nix + `just` toolkit that runs everything on a local
rootless k3s node.

```
deployment/
├── flake.nix                 dev shell (k3s, kubectl, helm, argocd, just); auto-starts k3s
├── justfile                  bootstrap / refresh / teardown recipes
├── argocd/
│   ├── root-app.yaml         app-of-apps for a shared cluster (syncs environments/)
│   └── environments/         one Argo CD Application per environment
└── helm/zero-to-kanban/      the app chart (auth, backend, frontend, 2x Postgres, Traefik routes)
```

## Local quick start

**Requirements:** Linux (WSL2 works) with Nix (flakes enabled) and a systemd
user session with cgroup v2 delegation (`loginctl enable-linger $USER`).

```bash
nix develop ./deployment   # enters the shell AND starts a rootless k3s node
just up-local              # installs Argo CD, deploys your local checkout
```

After a minute or two:

| What         | URL                          | Login                                                                                          |
|--------------|------------------------------|------------------------------------------------------------------------------------------------|
| App          | http://localhost:18080       | register an account in the app                                                                 |
| Argo CD      | https://localhost:18081      | `admin` / `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' \| base64 -d` |
| Alertmanager | http://localhost:18082       | none (only if monitoring is installed, see below)                                                  |
| Traefik metrics | http://localhost:18080/metrics | `metrics` / `dev-only-change-me`                                                            |

The k3s node stops when the shell that started it exits. Other shells
opened in `deployment/` reuse the running node.

### `up-local` vs `up-gitops`

| Recipe           | Argo CD syncs from                           | To ship a change                  | Force a sync          |
|------------------|----------------------------------------------|-----------------------------------|-----------------------|
| `just up-local`  | your local repo, current branch (`file://`)  | `git commit` (no push needed)     | `just refresh-local`  |
| `just up-gitops` | GitHub, `main`                               | `git commit && git push` to main  | `just refresh-gitops` |

Argo CD always deploys a commit. Uncommitted changes are never deployed.
Use one mode at a time: both deploy to the `ztk-dev-k3s` namespace and serve
the same routes. Run `just rm` before switching modes.

### Optional: monitoring (Prometheus + Alertmanager)

```bash
kubectl apply -n argocd -f argocd/environments/monitoring-k3s-app.yaml
just up-local              # re-run to bind Alertmanager to localhost:18082
```

It has no alert rules and no notification receiver yet, and it keeps no data
across restarts.

### All recipes

| Recipe                         | Does                                                                   |
|--------------------------------|------------------------------------------------------------------------|
| `just`                         | list recipes                                                           |
| `just up-local` / `up-gitops`  | install Argo CD if missing, apply the Application, bind the local ports (safe to re-run) |
| `just refresh-local` / `refresh-gitops` | make Argo CD re-read the repo now instead of on its next poll |
| `just rm`                      | delete the Argo CD Applications and Argo CD itself. The k3s node keeps running. |
| `just down`                    | stop k3s and the port-forwards. Data on disk is kept.                  |
| `just nuke`                    | stop k3s and delete all its data (Argo CD, databases, everything)      |

To restart after `just down`, run `nix develop ./deployment` then `just up-local`.

### Shell settings

Set these before running `nix develop`:

| Variable           | Default                             | Effect                                             |
|--------------------|-------------------------------------|----------------------------------------------------|
| `K3S_NO_AUTOSTART` | unset                               | `1` = don't start k3s; print the command instead   |
| `ZTK_STATE_DIR`    | `$XDG_STATE_HOME/zero-to-kanban-k3s` (`~/.local/state/...`) | k3s data, kubeconfig and logs. Must be outside `deployment/`. |

The shell exports `KUBECONFIG` (pointing into the state dir) and `GIT_BRANCH`
(the branch `just up-local` deploys).

### Logs and troubleshooting

| Problem                             | Look at                                                        |
|-------------------------------------|----------------------------------------------------------------|
| k3s won't start or became unready   | `$ZTK_STATE_DIR/.k3s/k3s.log`                                  |
| `delegated cgroup v2 controllers are required` | systemd user session / linger is not set up (see the comments in `flake.nix`) |
| a localhost port stopped responding | `$ZTK_STATE_DIR/<name>-portforward.log`, then re-run `just up-local` |
| app pods not coming up              | `kubectl -n ztk-dev-k3s get pods`, or the Argo CD UI           |

## The Helm chart

`helm/zero-to-kanban` deploys:

| Component  | Image                                        | Port | Database                        |
|------------|----------------------------------------------|------|---------------------------------|
| `auth`     | `ghcr.io/julian52575/zero-to-kanban-auth`     | 4000 | `authdb` (its own Postgres)     |
| `backend`  | `ghcr.io/julian52575/zero-to-kanban-backend`  | 3000 | `postgresql`                    |
| `frontend` | `ghcr.io/julian52575/zero-to-kanban-frontend` | 3000 | none                               |

Both Postgres instances come from the Bitnami `postgresql` chart. Services
run their own migrations on startup.

**Routing** is done by a Traefik `IngressRoute` that matches on path only,
with no hostname. It is the same routing as `docker-compose.yml`:

| Path                          | Goes to               | Protection                                   |
|-------------------------------|-----------------------|----------------------------------------------|
| `/auth*`, `/login`, `/register` | auth                | public                                       |
| `/metrics`                    | Traefik's own metrics | separate BasicAuth (`ingress.metrics.auth`)  |
| `/items*`                     | backend               | login required (ForwardAuth to auth)         |
| everything else               | frontend              | login required                               |

On protected routes, client-sent `X-Auth-User-*` headers are removed. The
auth service then sets them after it checks the session.

**Dev credentials** are plaintext defaults in `values.yaml`, for disposable
clusters only:

| What                      | Value                                   |
|---------------------------|-----------------------------------------|
| `/metrics` BasicAuth      | `metrics` / `dev-only-change-me`, e.g. `curl -u metrics:dev-only-change-me http://localhost:18080/metrics` |
| app DB (`postgresql`)     | user `todo`, password `todo`, database `todo` |
| auth DB (`authdb`)        | user `authuser`, password `authpass`, database `auth` |
| session signing key       | `dev-only-change-me`                    |

The `/metrics` Secret stores only a bcrypt hash, so the password can't be
read back from the cluster. Get it from `values.yaml` in dev, or from
whoever created the Secret in prod.

**Values files:** `values.yaml` holds the defaults. `values-dev.yaml` or
`values-prod.yaml` is layered on top of it.

| Setting                | dev                                  | prod                                    |
|------------------------|--------------------------------------|-----------------------------------------|
| image tag / pull       | `manual-test`, `Always`              | `latest` (pin a release tag before real use) |
| replicas (be/auth/fe)  | 1 / 1 / 1                            | 4 / 2 / 2                               |
| frontend               | Vite dev server (1Gi limit)          | static bundle                           |
| secrets                | plaintext defaults in `values.yaml`  | pre-created Secrets (`existingSecret`)  |
| entrypoint / TLS       | `web`, no TLS                        | `websecure`, TLS from Secret `kanban-tls` |
| `/metrics` route       | on                                   | off                                     |
| DB volume sizes        | 1Gi / 1Gi                            | 10Gi / 5Gi                              |

Postgres images are pinned to `bitnamilegacy/postgresql` because Bitnami
removed the versioned tags. `values.yaml` alone does not set this pin, so
always add an environment file.

Render it without a cluster:

```bash
helm dependency build helm/zero-to-kanban
helm template ztk helm/zero-to-kanban -f helm/zero-to-kanban/values.yaml -f helm/zero-to-kanban/values-dev.yaml
```

## Argo CD Applications

| File (in `argocd/environments/`) | App name             | Namespace     | Source                      | Auto-sync | Applied by                   |
|----------------------------------|----------------------|---------------|-----------------------------|-----------|------------------------------|
| `dev-app.yaml`                   | `ztk-dev`            | `ztk-dev`     | GitHub `main`, dev values   | yes       | `root-app.yaml`              |
| `prod-app.yaml`                  | `ztk-prod`           | `ztk-prod`    | GitHub `main`, prod values  | **no**    | `root-app.yaml`              |
| `dev-k3s-app.yaml`               | `ztk-dev-k3s`        | `ztk-dev-k3s` | GitHub `main`, dev values   | yes       | `just up-gitops`             |
| `dev-k3s-local-app.yaml`         | `ztk-dev-k3s-local`  | `ztk-dev-k3s` | local repo, current branch  | yes       | `just up-local` (template, don't apply directly) |
| `monitoring-k3s-app.yaml`        | `ztk-monitoring-k3s` | `monitoring`  | `prometheus` chart 29.33.0  | yes       | manual `kubectl apply`       |

## Shared / production cluster

1. Install Argo CD in the cluster.
2. Create the prod Secrets in `ztk-prod`. `values-prod.yaml` only names
   them, so Argo CD never sees the values. Sealed Secrets or the External
   Secrets Operator can create them instead of `kubectl`.

   ```bash
   kubectl create namespace ztk-prod
   kubectl -n ztk-prod create secret generic zero-to-kanban-prod-auth \
     --from-literal=session-secret="$(openssl rand -hex 32)"
   # the Bitnami chart reads both keys: the app user and the `postgres` superuser
   kubectl -n ztk-prod create secret generic zero-to-kanban-prod-postgresql \
     --from-literal=password='<strong>' --from-literal=postgres-password='<strong>'
   kubectl -n ztk-prod create secret generic zero-to-kanban-prod-authdb \
     --from-literal=password='<strong>' --from-literal=postgres-password='<strong>'
   kubectl -n ztk-prod create secret tls kanban-tls --cert=tls.crt --key=tls.key
   ```

   `/metrics` is off in prod. To turn it on, set `ingress.metrics.enabled: true`
   and `ingress.metrics.auth.existingSecret: zero-to-kanban-prod-metrics-auth`,
   then create that Secret. It holds an htpasswd file under the key `users`:

   ```bash
   htpasswd -nBC 10 metrics | kubectl -n ztk-prod create secret generic \
     zero-to-kanban-prod-metrics-auth --from-file=users=/dev/stdin
   ```

3. Apply the root app once. It then creates and manages `ztk-dev` and `ztk-prod`:

   ```bash
   kubectl apply -n argocd -f argocd/root-app.yaml
   ```

4. **Promote to prod:** after a change is verified in `ztk-dev`, sync
   `ztk-prod` by hand from the Argo CD UI or with `argocd app sync ztk-prod`.
