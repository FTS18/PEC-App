# Archived Features

This folder stores modules removed from the active runtime but kept for reference.

## Removed Scope

The following feature groups were moved out of active code paths:

- Fees and payment settings
- Library and books
- Assignments
- Grades
- Placement recruiter workflows
- Super admin-specific modules

## Structure

- `removed-features/frontend/`: Archived React/Next frontend pages and components.
- `removed-features/backend/`: Archived NestJS modules and related backend code.

## Reactivation Notes

If a feature needs to be re-enabled:

1. Move the feature files back to their original locations.
2. Reconnect route registrations and navigation links.
3. Re-enable backend module imports in `server/src/app.module.ts`.
4. Verify API DTO/service dependencies and Prisma models.
5. Run full builds for frontend and backend before release.

## Current Policy

Archived code is not part of the active build or navigation and should not be imported by runtime modules.
