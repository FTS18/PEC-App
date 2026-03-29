# Archived Features

This folder stores modules removed from the active runtime but kept for reference.

## Removed Scope

The following feature groups have been moved out of active code paths and are preserved here for reference or potential future reactivation:

### Student Management Features
- **Assignment Management** - Assignment creation, submission, and grading workflows
- **Grades Management** - Grade entry, publishing, and transcript generation (replaced by examinations)
- **Leave Management** - Student/faculty leave applications and approval workflows

### Placement Features
- **Placement Drives** - Campus recruitment drive management and tracking
- **Job Postings** - Job board and application management
- **Recruiter Workflows** - Recruiter-specific modules and dashboards
- **Career Portal** - Career guidance and resource management

### Finance Features
- **Fee Payment Processing** - Online fee payment gateway integration
- **Financial Reporting** - Financial analytics and reporting
- **Scholarship Management** - Scholarship tracking and disbursement
- **Payment Gateway Settings** - Payment configuration (replaced by simplified payment settings)

### Library Features
- **Book Catalog** - Library book catalog and management
- **Book Lending** - Book borrowing and return tracking
- **Digital Resources** - E-books, journals, and research materials access
- **Fine Management** - Overdue fine calculation and payment

### Notification Features
- **Push Notification Service** - Legacy push notification system
- **SMS Notification Integration** - SMS-based notifications
- **Email Digest Service** - Automated email summaries

### Multi-Organization Features
- **Organization Management** - Multi-tenant organization support
- **Organization Settings** - Per-organization branding and configuration
- **Cross-Organization Reports** - Multi-org analytics and reporting
- **Organization Isolation** - Data separation between institutions

## Structure

- `removed-features/` - Contains archived feature modules organized by category
  - `frontend/` - Archived React/Next frontend pages and components
  - `backend/` - Archived NestJS modules and related backend code

## Reactivation Notes

If a feature needs to be re-enabled:

1. **Frontend Features**
   - Move the feature files back to their original locations under `app/(protected)/`
   - Reconnect route registrations and navigation links
   - Update any imports for changed dependencies
   - Test the feature with current authentication system

2. **Backend Features**
   - Move the module files back to `server/src/`
   - Reconnect module imports in `server/src/app.module.ts`
   - Update database schema if needed (create new migration)
   - Verify API DTO/service dependencies and Prisma models

3. **Database Changes**
   - Run migrations if database schema changed
   - Verify data integrity for any existing data
   - Update seed scripts if needed

4. **Testing**
   - Run full builds for frontend and backend
   - Test authentication and authorization flows
   - Verify data fetching and state management
   - Check for any breaking changes in dependencies

## Current Policy

Archived code is not part of the active build or navigation and should not be imported by runtime modules. This ensures:
- Clean codebase without dead code paths
- Easier maintenance of active features
- Clear separation between production and experimental code

## Feature Restoration Priority

If considering restoration, features are ranked by potential impact:

### High Priority (Frequently Requested)
1. Assignment Management
2. Library Management
3. Fee Payment Processing

### Medium Priority (Important but Less Urgent)
4. Leave Management
5. Placement Drives
6. Multi-Organization Support

### Lower Priority (Nice to Have)
7. SMS Notifications
8. Career Portal
9. Digital Library Resources

## Migration Notes

When restoring features, be aware of:
- API changes in the backend structure
- Component library updates (shadcn/ui changes)
- Authentication/authorization pattern updates
- Database schema modifications
- Dependencies version changes

---

*Last Updated: March 2026*
