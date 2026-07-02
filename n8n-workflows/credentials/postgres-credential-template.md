# Postgres Credential — `Daily Digest` workflow

The `daily-digest.json` workflow's "Get Top Streams" node needs a Postgres credential
named **"Neon (buildablelabs)"** in your n8n instance (Credentials → New → Postgres).

Fill in these fields using the same values as the backend's `DATABASE_URL`
(`backend/.env`) — do not paste the connection string itself, n8n's Postgres
credential wants the parts separately:

| Field    | Value                                                        |
|----------|---------------------------------------------------------------|
| Host     | the `...neon.tech` host from `DATABASE_URL`                   |
| Port     | `5432`                                                         |
| Database | `neondb`                                                        |
| User     | the `neondb_owner`-style user from `DATABASE_URL`              |
| Password | the password from `DATABASE_URL`                                |
| SSL      | `require`                                                        |

Never commit the actual credential export — this folder's `*.json` files are
gitignored for exactly that reason (see `n8n-workflows/README.md`).
