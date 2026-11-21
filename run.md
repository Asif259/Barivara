# BariVara Monorepo - Development Startup

### Start Both Web & API Together (Monorepo Root)
```bash
npm run dev
```
Turborepo will launch both `apps/web` (Next.js on `http://localhost:3000`) and `apps/api` (NestJS on `http://localhost:4000`) concurrently.

---

### Run Separately

#### API Only
```bash
# From root via Turborepo filter
npm run dev -- --filter=barivara-api

# Or directly in apps/api
cd apps/api
npm run start:dev
```

#### Web Only
```bash
# From root via Turborepo filter
npm run dev -- --filter=barivara-web

# Or directly in apps/web
cd apps/web
npm run dev
```

---

### Monorepo Commands (From Root)
- `npm run build` - Builds both apps with Turborepo caching
- `npm run lint` - Runs linter across all workspaces
- `npm run typecheck` - Runs TypeScript checks across all workspaces
- `npm run test` - Runs test suites across all workspaces
