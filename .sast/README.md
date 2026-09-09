# `.sast/` — Static Application Security Testing

Config, helper scripts and branch-local reports for the jobs in
[`.github/workflows/ci-sast.yml`](../.github/workflows/ci-sast.yml).

```
.sast/
├── sonar-project.properties   SonarQube Cloud scan settings
├── bin/
│   └── sonar-report.sh        builds report/sonarqube/ from a finished analysis
└── report/
    └── sonarqube/             refreshed by CI, committed to the branch
        ├── summary.md         human-readable digest (also the job summary)
        ├── badge.svg          gate badge, shown in the root README
        ├── measures.json      raw metric values
        └── quality-gate.json  raw gate status + failing conditions
```

## How the report stays current

Each tool's job in `ci-sast.yml` runs its scan, builds `report/<tool>/`, and
writes the same digest to the **workflow job summary**. A single
`commit-reports` job then collects every tool's report and commits them back to
the pull-request branch in **one commit**, just before `ci-sast-required`. So
the files — and the README badge, which references `badge.svg` by a **relative
path** — always reflect the branch you are viewing. The record reaches `main`
only when the PR merges; CI never pushes to `main`.

That commit is made with the default `GITHUB_TOKEN` and its message carries
`[skip ci]`, so it starts **no** further workflow run (GITHUB_TOKEN pushes
never trigger `push` / `pull_request` workflows; `.sast/report/**` is also in
the relevant `paths-ignore` lists).

**Skipped runs:** draft pull requests (SAST runs once the PR is marked ready)
and pull requests from forks (no `SONARQUBE_TOKEN`). In both cases the tool
jobs and `commit-reports` are skipped, and `ci-sast-required` stays green.

## SonarQube Cloud

One-time setup:

1. Sign in at <https://sonarcloud.io> with the GitHub account and create an
   organization bound to this repo's owner.
2. **Analysis Method:** in the project's
   *Administration → Analysis Method*, turn **Automatic Analysis off**. It
   conflicts with the CI-based scan and the workflow will error while it's on.
3. Generate a token (*My Account → Security*) and add it to the repo as the
   `SONARQUBE_TOKEN` Actions secret.
4. Put the org key and project key into `sonar-project.properties` (the
   `REPLACE_WITH_*` placeholders).
5. Let one run land on `main` first — SonarQube Cloud needs a base-branch
   analysis before it can decorate pull requests.

The full analysis (issues, hotspots, history) stays in the SonarQube Cloud UI;
`report/sonarqube/` is just the at-a-glance record. The job fails if the
project's **Quality Gate** does not pass.
