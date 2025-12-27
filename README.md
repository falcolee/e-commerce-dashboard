<div align="center">
  <img src="./public/logo.png" width="120" alt="E-commerce Dashboard" />
  <h1>E-commerce Dashboard</h1>
  <p>A React + TypeScript admin dashboard for e-commerce operations (products, orders, customers, analytics).</p>
</div>

---

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![react](https://img.shields.io/badge/react-18.3.1-61dafb.svg)](https://react.dev/)
[![vite](https://img.shields.io/badge/vite-5.4-646cff.svg)](https://vitejs.dev/)
[![vite](https://img.shields.io/badge/antd-5.28.0-1677FF.svg)](https://ant.design/)

## Contents

- [Introduction](#introduction)
- [Highlights](#highlights)
- [Features (Pages)](#features-pages)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Mock API (MSW)](#mock-api-msw)
- [Project Structure](#project-structure)
- [Development Notes](#development-notes)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Introduction

`e-commerce-dashboard` is a modern admin UI built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. It combines shadcn/ui (design-system-friendly primitives) with Ant Design (enterprise-grade data components) to support complex back-office workflows.

## Highlights

- React 18 + TypeScript + Vite (fast HMR, strict typing)
- shadcn/ui + Radix primitives for accessible base components
- Ant Design for data-heavy UI (tables, forms, drawers, upload, etc.)
- React Query for server state (caching, refetching, mutations)
- MSW-based mock API (toggle via build flag, URL param, or localStorage)
- OpenAPI docs included (`docs/swagger.yaml`, `docs/swagger.json`)

## Features (Pages)

This repo includes a set of admin pages that cover typical e-commerce back-office modules:

- Dashboard: overview charts and KPI cards
- Catalog: products, attributes, categories, tags, product editor
- Orders: orders, shipments, shipping methods
- Customers: customer list and details
- Marketing & content: coupons, posts, post categories, pages, page categories, comments, media
- Payments: payment gateway configuration
- Auth & access: roles and permissions (RBAC)
- Ops: settings, token logs

> If you’re looking for a specific module/page, start in `src/pages/admin/`.

## Tech Stack

- UI: `shadcn/ui` + `@radix-ui/*`, Tailwind CSS, Ant Design (`antd`)
- Data: Axios, TanStack React Query (`@tanstack/react-query`)
- Routing: React Router (`react-router-dom`)
- Forms & validation: React Hook Form + Zod
- Charts: Recharts (and `@ant-design/plots` for AntD charts)
- i18n: `i18next` + `react-i18next`
- Mocks: MSW (`msw`) + generated datasets (`pnpm generate-mocks`)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended; `pnpm-lock.yaml` is committed)

### Setup

Clone the repository:
```bash
git clone <repository-url>
cd e-commerce-dashboard
```

### Install

```bash
pnpm install
cp .env.example .env
```

### Run (development)

```bash
pnpm dev
or
npm run dev
```

The dev server runs at `http://localhost:8080` (see `vite.config.ts`).

## Configuration

Environment variables live in `.env` (start from `.env.example`):

| Variable | Example | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api/v1/admin` | Backend admin API base URL |
| `VITE_SWAGGER_URL` | `http://localhost:3000/swagger/doc.json` | Remote swagger JSON (optional) |
| `VITE_USE_MOCKS` | `false` | Force-enable/disable MSW mocks |
| `VITE_MOCK_SEED` | `1` | Deterministic mock dataset seed |
| `VITE_MOCK_COUNT` | `20` | Mock dataset size |
| `VITE_MOCK_AUTH` | `relaxed` | `strict` or `relaxed` |
| `VITE_MOCK_ERROR_RATE` | `0` | `0` to `1` error probability |
| `VITE_MOCK_NOT_FOUND` | `true` | Enable 404 simulation |

## Mock API (MSW)

Mocks can be enabled in multiple ways:

- Build flag: set `VITE_USE_MOCKS=true`
- URL param: open the app with `?mock=1`
- Local storage: set `localStorage.USE_MOCKS = "1"`

Mock settings are defined in `src/mocks/config.ts`.

To (re)generate mock data from the OpenAPI spec:

```bash
pnpm generate-mocks
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm build:dev` | Development-mode build |
| `pnpm preview` | Preview the build |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript typecheck |
| `pnpm generate-mocks` | Generate mock data (Python) |

## Project Structure

```
e-commerce-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── common/          # Shared utility components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   └── product-editor/  # Product management components
│   ├── pages/               # Route-level pages
│   ├── layouts/             # Layout components
│   ├── providers/           # App providers (query, theme, etc.)
│   ├── lib/                 # Utilities and API client
│   ├── mocks/               # MSW setup + generated mock data
│   ├── types/               # Shared TypeScript types
│   └── main.tsx             # Entry
├── docs/
│   ├── swagger.yaml         # OpenAPI 3.1 spec
│   └── swagger.json         # OpenAPI JSON
└── scripts/                 # Utility scripts (mocks generation)
```

## Development Notes

### UI Components: shadcn/ui vs Ant Design

- Prefer `shadcn/ui` for small, design-system-friendly building blocks (buttons, inputs, dialogs, menus).
- Prefer `antd` for complex enterprise widgets (tables with sorting/filtering/pagination, advanced forms, upload, drawers).

### Data Fetching Pattern (React Query)

- Queries live in hooks and use stable `queryKey`s for caching.
- Mutations should invalidate affected queries for consistency.

### Mock Toggle Priority

`src/mocks/config.ts` enables mocks in this order:

1. `VITE_USE_MOCKS` (if set)
2. `?mock=1`
3. `localStorage.USE_MOCKS === "1"`

## Deploy Mock (Static)

This repo can be deployed as a fully-static “mock” dashboard (no backend) using MSW.

### GitHub Pages (automatic)

1. In GitHub, open **Settings → Pages** and set **Build and deployment** to **GitHub Actions**.
2. Push to `main` (or run the workflow manually).

Workflow: `.github/workflows/pages-mock.yml`.

### Vercel (automatic)

1. Import the repo in Vercel (Framework preset: Vite).
2. Set environment variables:
   - `VITE_USE_MOCKS=true`
   - (optional) `VITE_API_BASE_URL=/api/v1/admin`
3. Build command: `pnpm build` (or `npm run build`)
4. Output directory: `dist`

## API Documentation

- OpenAPI YAML: `docs/swagger.yaml`
- OpenAPI JSON: `docs/swagger.json`

## Contributing

- Use `pnpm lint` and `pnpm type-check` before opening a PR.
- Follow Conventional Commits (see `AGENTS.md`).

## License

MIT — see `LICENSE`.
