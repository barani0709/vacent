# Excel-Driven Interactive Dashboard

Frontend-only Next.js app that uploads Excel, syncs to Neon PostgreSQL directly in the browser, and provides an editable PrimeReact table with CRUD and export.

## Quickstart

1) Install deps

```bash
npm install
```

2) Configure Neon connection: create `.env.local` with

```
NEXT_PUBLIC_DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
```

3) Run dev server

```bash
npm run dev
```

Open http://localhost:3000

## Features
- Upload Excel (.xlsx) → SheetJS parses to JSON
- Upsert to Neon (divisions, hq, employees)
- Editable table (inline), add, delete
- Export visible data to Excel

## Schema
Auto-created on first run by `ensureSchema()`:
- divisions(id, name unique, region)
- hq(id, name, division_id, unique(name, division_id))
- employees(id, name, designation, vacancy, remarks, division_id, hq_id, updated_at)

## Notes
- This connects to Neon from the browser; use a limited user.
- Consider auth and RLS for multi-user production scenarios.
