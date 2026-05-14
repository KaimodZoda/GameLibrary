# Prisma Migration Checklist

Use this checklist every time we change `prisma/schema.prisma`.

## 1) Before Creating Migration

- Pull latest code and verify current branch is correct.
- Confirm `.env` points to the intended database.
- Review schema changes for risk:
  - low risk: add table/column/index/enum value
  - medium risk: rename fields, unique/index changes
  - high risk: drop column/table, type conversion
- If high risk, plan data migration SQL first.
- Optional safety backup for production-like data:
  - take a DB snapshot or export critical tables.

## 2) Create / Update Migration

- Validate schema first:
  - `npm.cmd exec prisma validate`
- Create migration:
  - local interactive env: `npm.cmd exec prisma migrate dev --name <migration_name>`
  - non-interactive env: create SQL migration file manually, then use `migrate deploy`
- If Prisma reports unexecutable changes, do one of these:
  - create migration SQL manually with explicit casts
  - split into multiple migrations (data fix first, type change second)

## 3) Apply Migration

- Apply to target DB:
  - `npm.cmd exec prisma migrate deploy`
- Regenerate client if needed:
  - `npm.cmd exec prisma generate`

## 4) Verify App Compatibility

- Update affected code paths:
  - API route status checks/writes
  - Zod validations
  - frontend types and status mapping
- Run build and basic tests:
  - `npm.cmd run build`
- Smoke test core flows:
  - auth
  - borrow flow
  - return flow
  - admin approve/reject/pickup/complete actions

## 5) Do We Need Seed Again?

Seed is needed when:

- database was reset (`prisma migrate reset`)
- new environment has empty DB
- test/demo data must match new schema behavior

Seed is usually not needed when:

- migration only changes structure safely and existing data remains valid

Seed command:

- `npm.cmd run db:seed`

## 6) Team Hygiene

- Commit `schema.prisma` and migration folder together.
- Never edit already-applied migration history retroactively.
- Add short notes in PR if migration contains data conversion or manual SQL.
