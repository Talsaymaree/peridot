## Peridot

Peridot is a Next.js app with Prisma-backed local profiles. In local-only mode, user data is stored in SQLite. For server deployment, that database should live outside the image so updates do not overwrite data and your personal workspace never ships inside the deployable artifact.

## Local Development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` if you want local overrides.
3. Start the app with `npm run dev`.

The default development database is `prisma/dev.db`.

## Portainer Deployment

Use the included `docker-compose.yml` as your Portainer stack. It is set up to:

- keep the SQLite database in a Docker volume at `/data/peridot.db`
- keep runtime data outside the image so container rebuilds do not wipe it
- exclude local `.env` and SQLite files from the Docker build context
- let you redeploy updates without wiping user data

Recommended runtime values:

```env
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=3000
DATABASE_URL=file:/data/peridot.db
```

### Deploy

1. In Portainer, create a new stack.
2. Paste in `docker-compose.yml`, or point Portainer at this repo.
3. Change the published port if you want something other than `3000`.
4. Deploy the stack.

On first boot, the app creates the SQLite database inside the `peridot-data` volume and bootstraps the required tables automatically.

### Update Later

If Portainer is tracking this repo:

1. Pull the latest code in Portainer.
2. Rebuild or redeploy the stack.

If you build elsewhere:

1. Build and push a new image tag.
2. Update the stack to that image.
3. Redeploy.

Your profiles, routines, and history stay in the named volume, so updating the app does not replace your data.

## Privacy

The deployable image excludes:

- `.env`
- `prisma/dev.db`
- other local SQLite database files

That keeps your username and personal workspace data out of the shipped image unless you intentionally import them into the running server.
