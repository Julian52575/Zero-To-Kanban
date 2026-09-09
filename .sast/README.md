# `.sast/` — Static Application Security Testing config

Per-tool configuration for the jobs in
[`.github/workflows/ci-sast.yml`](../.github/workflows/ci-sast.yml). One file
per tool.

| File | Tool | Runs as |
| --- | --- | --- |
| `sonar-project.properties` | SonarQube Cloud | `sonarqube` job |

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

The scan reports to SonarCloud and fails the job if the project's **Quality
Gate** does not pass.

### Output

The analysis lives in the SonarQube Cloud UI — the scan commits nothing back
to the repo. Each run uploads `report-task.txt` as the `sonarqube-report-task`
workflow artifact (retained 30 days): ~6 lines of plain text with the
`dashboardUrl` and `ceTaskUrl` for that run. The rest of the scanner's
`.scannerwork/` scratch is protobuf and is not archived.
