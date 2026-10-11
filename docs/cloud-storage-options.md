# BIORICHEBRAIN — cloud storage and free-tier options

Checked: 2026-10-11. Free quotas and eligibility can change; verify provider terms before enabling billing.

## Recommended split

Object storage is for files, exports, audit archives, datasets, and backups. It is **not** a substitute for a continuously running worker. Keep the task queue on durable storage and only add an object-storage adapter after credentials are provisioned and integration tests exist.

### 1. Cloudflare R2 — recommended object-storage candidate

- Official pricing and free allowance: https://developers.cloudflare.com/r2/pricing/
- Dashboard: https://dash.cloudflare.com/
- S3-compatible API docs: https://developers.cloudflare.com/r2/api/s3/
- Free Standard allowance listed by provider: 10 GB-month storage, 1 million Class A operations and 10 million Class B operations per month; no egress fee. Usage beyond the allowance can be billed.
- Intended use: encrypted backup/archive of project files and audit exports, not as the live task queue without a tested adapter.

Connection checklist:
1. Create an R2 bucket in the Cloudflare dashboard.
2. Create a scoped S3 API token for that bucket only.
3. Store credentials in the hosting provider's secret manager, never in Git, this document, or chat.
4. Configure endpoint, bucket, access key and secret key in the service environment.
5. Test upload, download, deletion, access denial, and recovery before storing production data.

Typical environment variable names for a future S3-compatible adapter (not currently consumed by the headless service):
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_REGION=auto`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

**Important:** adding these variables alone does not enable backup. The service currently does not implement an R2/S3 storage adapter.

### 2. Dropbox — user file storage

- Connect at: https://www.dropbox.com/
- Useful for human-managed documents, reports and exported files.
- ChatGPT Dropbox integration can be connected through the app's connection flow. It does not automatically make Dropbox the service's persistent disk or task queue.

### 3. GitHub free-tier catalogue

- Curated directory: https://github.com/ePlus-DEV/free-tier-hub
- Storage comparison: https://github.com/mixpeek/awesome-object-storage
- GitHub Codespaces free quota details: https://docs.github.com/en/billing/concepts/product-billing/github-codespaces

Codespaces is a development environment with monthly quotas, not a guaranteed 24/7 production host.

### 4. Always-on service hosting

The headless service has a Dockerfile and Compose configuration in this repository. A hosting account must be connected and its persistent-disk and free-plan rules verified before deployment. Do not assume a free tier offers indefinite uptime or persistent volumes.

## Security and cost guardrails

- Never commit API keys, access tokens, signed URLs, or real `.env` files.
- Use least-privilege, bucket-scoped credentials and rotate them if exposed.
- Enable budget/usage alerts where available.
- Keep a separate backup and periodically test restore.
- Do not place sensitive product formulas, personal data, or commercial secrets in a public bucket.
