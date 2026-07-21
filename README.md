# Свечка

Voice diary PWA — record an evening voice note, get one clarifying question from an AI when
useful, and a short summary of the day. Weekly retrospectives summarize the week's entries.

This repo holds everything except the backend: the React PWA frontend, the Caddy reverse
proxy config, and the docker-compose file that wires the whole stack together. The Spring
Boot backend lives in the sibling repo `svechka_backend` — this compose file expects it
checked out at `../svechka_backend`.

## Layout

- `frontend/` — React + TypeScript + Vite PWA
- `caddy/Caddyfile` — reverse proxy: `/api/*` → backend, everything else → frontend
- `docker-compose.yml` — postgres + backend + frontend + caddy

## Running the full stack locally

```bash
cp .env.example .env   # fill in DOMAIN (use "localhost" for local dev)
docker compose up --build
```

Then open `https://localhost` (Caddy uses its internal CA for `localhost`, so your browser
will need to trust it — Chrome/Firefox usually do this automatically for `caddy:2-alpine`'s
internal cert on first run, otherwise accept the browser warning for local dev).

For production, set `DOMAIN` in `.env` to your real domain — Caddy will automatically obtain
and renew a Let's Encrypt certificate for it.

## Frontend-only development

```bash
cd frontend
npm install
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:8080` by default (see
`vite.config.ts`) — run the backend separately (see `svechka_backend/README.md`).

## Privacy

The consent screen shown before first use explains, in plain language, that recorded audio
is sent to an external transcription service (and deleted server-side immediately after
transcription) and that the resulting text is sent to an LLM to generate the follow-up
question, day summary, and weekly retrospectives.
