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

That commit is pushed with the **`SAST_REPORT_TOKEN`** PAT (Contents: read and
write), so — unlike a `GITHUB_TOKEN` push — it re-triggers `ci` and `ci-sast`
on the new commit. That is deliberate: the required checks must report on the
head SHA or the PR softlocks. The follow-up `ci-sast` run would otherwise scan
and commit again, so a `guard` job at the top of the workflow detects that the
branch head is a `ci(sast): refresh SAST reports…` commit and skips the scan +
commit — the loop stops after one extra (near-instant) run.

**Skipped runs:** report-refresh commits (via `guard`), draft pull requests
(SAST runs once the PR is marked ready), and pull requests from forks (no
`SONARQUBE_TOKEN`). In each case the tool jobs and `commit-reports` are
skipped, and `ci-sast-required` stays green.

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
5. Add a **`SAST_REPORT_TOKEN`** Actions secret — a PAT with *Contents: read
   and write* on this repo — so `commit-reports` can push the refreshed report
   in a way that re-triggers CI on the new commit.
6. Let one run land on `main` first — SonarQube Cloud needs a base-branch
   analysis before it can decorate pull requests.

The full analysis (issues, hotspots, history) stays in the SonarQube Cloud UI;
`report/sonarqube/` is just the at-a-glance record. The job fails if the
project's **Quality Gate** does not pass.
