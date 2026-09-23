{{/* Base name for chart resources */}}
{{- define "zero-to-kanban.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{/* Fully qualified app name, e.g. <release>-zero-to-kanban */}}
{{- define "zero-to-kanban.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "zero-to-kanban.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Common labels */}}
{{- define "zero-to-kanban.labels" -}}
app.kubernetes.io/name: {{ include "zero-to-kanban.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* Hostname of the postgresql subchart's primary Service */}}
{{- define "zero-to-kanban.postgresql.host" -}}
{{- printf "%s-postgresql" .Release.Name -}}
{{- end -}}

{{/*
Name of the Secret holding the Postgres password.
- If postgresql.auth.existingSecret is set (prod), use that pre-created
  Secret directly -- nothing here ever sees the password.
- Otherwise (dev), fall back to the Secret the bitnami postgresql subchart
  generates itself from postgresql.auth.password.
*/}}
{{- define "zero-to-kanban.postgresql.secretName" -}}
{{- if .Values.postgresql.auth.existingSecret -}}
{{- .Values.postgresql.auth.existingSecret -}}
{{- else -}}
{{- include "zero-to-kanban.postgresql.host" . -}}
{{- end -}}
{{- end -}}

{{/* Key within that Secret that holds the password */}}
{{- define "zero-to-kanban.postgresql.secretKey" -}}
{{- .Values.postgresql.auth.secretKeys.userPasswordKey | default "password" -}}
{{- end -}}

{{/* Hostname of the auth-dedicated postgresql (authdb alias) Service */}}
{{- define "zero-to-kanban.authdb.host" -}}
{{- printf "%s-authdb" .Release.Name -}}
{{- end -}}

{{- define "zero-to-kanban.authdb.secretName" -}}
{{- if .Values.authdb.auth.existingSecret -}}
{{- .Values.authdb.auth.existingSecret -}}
{{- else -}}
{{- include "zero-to-kanban.authdb.host" . -}}
{{- end -}}
{{- end -}}

{{- define "zero-to-kanban.authdb.secretKey" -}}
{{- .Values.authdb.auth.secretKeys.userPasswordKey | default "password" -}}
{{- end -}}

{{/* Name of the Secret holding SESSION_SECRET */}}
{{- define "zero-to-kanban.auth.secretName" -}}
{{- default (printf "%s-auth" (include "zero-to-kanban.fullname" .)) .Values.auth.existingSecret -}}
{{- end -}}

{{/* Name of the Secret holding /metrics' BasicAuth htpasswd file */}}
{{- define "zero-to-kanban.metricsAuth.secretName" -}}
{{- default (printf "%s-metrics-auth" (include "zero-to-kanban.fullname" .)) .Values.ingress.metrics.auth.existingSecret -}}
{{- end -}}

{{/* Key within that Secret that holds the htpasswd content */}}
{{- define "zero-to-kanban.metricsAuth.secretKey" -}}
{{- .Values.ingress.metrics.auth.existingSecretKey | default "users" -}}
{{- end -}}

{{/*
Init container that blocks until a Service accepts TCP connections. A
ClusterIP Service only routes to Ready pods, so this really waits for the
dependency's readinessProbe to pass, not just for its pod to exist. Runs in
the calling component's own image (all node-based) -- no extra image pull.
Usage: include "zero-to-kanban.waitFor" (dict "name" "db" "host" "..." "port" 5432 "image" .Values.backend.image)
*/}}
{{- define "zero-to-kanban.waitFor" -}}
- name: wait-for-{{ .name }}
  image: "{{ .image.repository }}:{{ .image.tag }}"
  imagePullPolicy: {{ .image.pullPolicy }}
  command:
    - sh
    - -c
    - |
      until node -e "require('net').connect({{ .port }}, '{{ .host }}').on('connect', () => process.exit(0)).on('error', () => process.exit(1)); setTimeout(() => process.exit(1), 2000)"; do
        echo "waiting for {{ .host }}:{{ .port }} to be ready..."
        sleep 2
      done
{{- end -}}
