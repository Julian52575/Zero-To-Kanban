# `.sast/` — Static Application Security Testing

Config, helper scripts and branch-local reports for the jobs in
[`.github/workflows/ci-sast.yml`](../.github/workflows/ci-sast.yml).

```
.sast/
├── sonar-project.properties   SonarQube Cloud scan settings
├── codeql-config.yml          CodeQL paths / query suite
├── bin/
│   ├── sonar-report.sh        builds report/sonarqube/ from a finished analysis
│   └── codeql-report.sh       builds report/codeql/ from the analyze SARIF
└── report/
    ├── sonarqube/             refreshed by CI, committed to the branch
    │   ├── summary.md         human-readable digest (also the job summary)
    │   ├── badge.svg          gate badge, shown in the root README
    │   ├── measures.json      raw metric values
    │   └── quality-gate.json  raw gate status + failing conditions
    └── codeql/                refreshed by CI, committed to the branch
        ├── summary.md         human-readable digest (also the job summary)
        ├── badge.svg          verdict badge, shown in the root README
        ├── findings.json      normalised findings + counts by severity
        └── results.sarif      raw CodeQL SARIF (all languages merged)
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
and commit again, so a `guard` job detects that the branch head is a
`ci(sast): refresh SAST reports…` commit: the tool jobs then run but skip every
real step, **reporting success without re-scanning**. The loop stops after one
extra (near-instant) run, and every check stays green on the new SHA.

**No-scan runs:** report-refresh commits — the tool jobs and `commit-reports`
run to green as a no-op.

**Skipped runs:** draft pull requests (SAST runs once the PR is marked ready),
pull requests from forks (no `SONARQUBE_TOKEN`), and Dependabot pull requests
(Actions secrets are withheld from Dependabot, so `SONARQUBE_TOKEN` is
unavailable — SAST runs when the bump merges to `main`) — the tool jobs and
`commit-reports` are skipped and `ci-sast-required` stays green.

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

## CodeQL

Runs entirely inside the workflow — `github/codeql-action/init` +
`analyze` with **`build-mode: none`** (JavaScript/TypeScript needs no build) and
**`upload: never`**, so it depends on neither GitHub Advanced Security nor code
scanning being enabled and the `codeql` job needs only `contents: read`.

`bin/codeql-report.sh` parses the SARIF `analyze` writes to
`.sast/codeql-results/` (git-ignored scratch) into `report/codeql/`:

- **`findings.json`** — every result normalised to
  `{ ruleId, name, level, securitySeverity, message, file, line }`, plus
  `bySeverity` counts and a `verdict`.
- **`summary.md`** — the digest, also written to the workflow job summary.
- **`badge.svg`** — `passed` (green) / `warning` (yellow) / `failed` (red),
  referenced by `README.md` via a relative path.
- **`results.sarif`** — the raw SARIF, kept so it can be uploaded later by hand.

**Gate:** the job fails when any **error-severity** result is present (CodeQL
marks high/critical security issues as `error`). Warning- and note-severity
results are recorded but do not block, mirroring the SonarQube job.

What to scan and which query suite live in
[`codeql-config.yml`](./codeql-config.yml) — `paths` mirrors
`sonar-project.properties`' `sonar.sources`.

To also publish findings to the repo's **Security → Code scanning** tab, set
`upload: always` on the `Analyze` step and add `security-events: write` to the
`codeql` job's `permissions`. If GitHub's **default setup** for code scanning is
enabled it must be turned off first (*Settings → Code security → Code scanning →
Set up → Advanced*), the same way SonarQube Cloud's Automatic Analysis has to be
off — an advanced workflow and default setup cannot both run.
