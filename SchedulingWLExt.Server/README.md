# SchedulingWL Server — NestJS Migration

This project is the NestJS/TypeScript reimplementation of the uploaded
`SchedulingWLExt.Server` ASP.NET Core API.

## Migration approach

The HTTP contract and PostgreSQL schema are intentionally preserved where practical.
The implementation is reorganized around NestJS modules:

- `tenants`
- `onboarding`
- `availability`
- `booking`
- `oauth`
- `notifications`

The existing PostgreSQL database is treated as the source of truth during the
migration. TypeORM uses `synchronize: false`; it will not silently alter the
existing schema.

## Existing routes preserved

- `GET /api/tenants/:slug`
- `POST /api/onboarding`
- `PATCH /api/tenants/:slug/settings`
- `GET /auth/connect`
- `GET /auth/callback`
- `GET /availability`
- `POST /bookings`
- `DELETE /bookings/:id`

## Important note about the global prefix

The original .NET API uses `/api` for tenants/onboarding but not for
availability/bookings/auth. `main.ts` preserves that route layout using
Nest's global-prefix exclusion.

## Run

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, Google OAuth settings, SMTP settings, and CORS origins.
3. Run `npm install`.
4. Run `npm run start:dev`.

Swagger is available at `/docs`.

## Database

The entity mappings target the existing PostgreSQL tables:

- `Tenants`
- `Appointments`

The existing EF Core migration shows `WorkdayStart`/`WorkdayEnd` as PostgreSQL
`time without time zone`, so the NestJS entity represents them as `string`
(`HH:mm:ss`) rather than changing the database schema.

Appointment `Status` remains an integer to match the existing EF schema:
`0 = Confirmed`, `1 = Cancelled`.

## Deliberate next hardening steps

This is a faithful first migration, not a claim that the original API was
production-hardened. Before calling the NestJS version production-ready:

- move secrets to a proper secret manager;
- encrypt OAuth tokens at rest;
- add authentication/tenant ownership to onboarding/settings;
- add transactional/outbox handling for Google Calendar + email side effects;
- add rate limiting and structured logging;
- add unit/integration/e2e tests;
- make Google Calendar date/time handling tenant-time-zone aware;
- add explicit slot validation against tenant working hours;
- add an idempotency strategy for booking creation.
