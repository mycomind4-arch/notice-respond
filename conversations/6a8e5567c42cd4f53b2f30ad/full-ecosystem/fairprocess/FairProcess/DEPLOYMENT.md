# FairProcess Deployment

## Quick start: Docker Compose

```bash
docker compose up -d
```

This starts PostgreSQL + the API server with auto-migrations. The API will be available at `http://localhost:3001`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://fairprocess:fairprocess@localhost:5432/fairprocess` | PostgreSQL connection string |
| `PORT` | `3001` | API server port |
| `NODE_ENV` | `production` | Runtime environment |
| `RUTH_SUPABASE_URL` | — | Supabase project URL for Ruth Solv Flow integration |
| `RUTH_SERVICE_ROLE_KEY` | — | Supabase service role key for Ruth Solv Flow integration |

## Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway add --database postgresql
railway up
```

Railway auto-detects the Dockerfile and provisions PostgreSQL. Set `DATABASE_URL` to the Railway-provided Postgres URL.

## Deploy to Render

1. Create a new Web Service from this repo
2. Use Docker as the runtime
3. Add a PostgreSQL database
4. Set `DATABASE_URL` to the Render-provided connection string
5. Deploy

## Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch
fly launch --dockerfile Dockerfile
fly postgres create
# Set DATABASE_URL to the Fly Postgres connection string
fly deploy
```

## Deploy to DigitalOcean App Platform

1. Create a new app from this GitHub repo
2. Add a managed PostgreSQL database
3. Set `DATABASE_URL` to the connection string
4. Deploy

## Seed the policy bundle

After first deployment, load the Humboldt County policy:

```bash
curl -X POST https://your-api-url/api/policies \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-1" -H "x-actor-id: admin" \
  -d @policies/humboldt/hcc-352.recordation.json
```

## n8n integration

Point your n8n HTTP Request nodes to your deployed API URL. The workflow JSON files in `n8n-workflows/` reference `http://localhost:3001` — update the base URL to your deployed endpoint.

See `n8n-workflows/README.md` for workflow details.
