# n8n Workflows

Exported n8n workflow JSON files live in `workflows/`. Never commit real credentials — `credentials/` is for local credential *templates* only and is gitignored (except this README-style documentation).

## Workflows

- `stream-started.json` — triggered by the backend when a creator starts a stream. Formats a "creator went live" message and posts it to a Discord/Slack webhook.
- `viewer-milestone.json` — triggered when a stream's live viewer count crosses a milestone (10, 50, 100, 500, 1000, checked backend-side). The workflow itself re-checks `viewerCount >= 100` via an `IF` node before notifying, so only the significant milestone actually fires a notification.
- `stream-ended.json` — triggered when a creator ends a stream. Computes stream duration and final viewer count into a summary, and returns it as the webhook's HTTP response (`Respond to Webhook` node) rather than storing it, keeping the workflow dependency-free.
- `daily-digest.json` — runs on a daily cron schedule (9am), queries the last 24 hours of streams directly from the Neon Postgres database, and posts a "top streams" summary.

## Environment / configuration these workflows expect

- An n8n environment variable `DISCORD_WEBHOOK_URL` (or swap the `Send Notification` HTTP Request node's body for Slack's `{"text": ...}` shape and point it at a Slack incoming webhook instead — the node is generic HTTP, not Discord-specific).
- A Postgres credential named **"Neon (buildablelabs)"** for `daily-digest.json` — see `credentials/postgres-credential-template.md`.

See the root backend's `.env` for the three webhook URLs (`N8N_STREAM_STARTED_WEBHOOK_URL`, `N8N_VIEWER_MILESTONE_WEBHOOK_URL`, `N8N_STREAM_ENDED_WEBHOOK_URL`) that must point at wherever these workflows are hosted.
