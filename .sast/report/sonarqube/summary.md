## SonarQube Cloud

_No analysis recorded on this branch yet._

The `sonarqube` job in [`.github/workflows/ci-sast.yml`](../../../.github/workflows/ci-sast.yml)
rebuilds this file, `badge.svg`, `measures.json` and `quality-gate.json` on
every pull-request run; the `commit-reports` job then commits them back to the
PR branch. The values therefore always match the branch you are looking at.
The record reaches `main` when the PR merges — CI never pushes to `main`.
