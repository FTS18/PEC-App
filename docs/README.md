# Documentation Index

Welcome to the PEC Campus ERP documentation. This folder contains comprehensive guides and references for developers and administrators.

## Core Documentation

### [Architecture](./ARCHITECTURE.md)
Technical architecture of the PEC platform including:
- Frontend architecture (Next.js 15 App Router)
- Backend architecture (NestJS + Prisma)
- Data flow and state management
- Security and authentication
- Performance optimizations

### [Development Guide](./DEVELOPMENT.md)
Complete setup and development instructions:
- Prerequisites and installation
- Environment configuration
- Database setup
- Development commands
- Deployment instructions
- Troubleshooting guide

### [Features](./FEATURES.md)
Comprehensive feature documentation:
- Academic Management (Courses, Timetable, Attendance, Examinations)
- Campus Services (Hostel, Canteen, Campus Map, Room Booking)
- Communication (Chat, Notifications, Announcements)
- Student Services (Profile, Resume Builder, Help)
- Administration (User, Department, Faculty, Settings)
- AI-Powered Features (Chatbots, Resume Analyzer)
- User Experience (Themes, Multi-language, Search)

### [Quick Reference](./QUICK_REFERENCE.md)
Quick lookup guide for common tasks:
- Development commands
- Common code patterns
- File locations
- Key routes
- Environment variables
- Troubleshooting tips

## Backend Documentation

### [Server README](./server/README.md)
NestJS backend documentation including:
- Framework setup
- Module structure
- API endpoints
- Testing
- Deployment

### [Scaling & Platform](./server/SCALING_AND_PLATFORM.md)
Production deployment considerations:
- Database indexing
- Caching strategies
- Performance optimization
- Monitoring and logging
- Security recommendations

## Additional Resources

### Agent Skills
The project includes specialized skills for Next.js development:
- **nextjs15-performance** - Performance optimization patterns
- **nextjs-app-router-patterns** - App Router best practices
- **next-best-practices** - Next.js coding standards
- **next-cache-components** - Cache optimization
- **find-skills** - Discover available skills
- **eraser-diagrams** - Architecture visualization

Location: `.agents/skills/`

### API Documentation
For API endpoints and request/response formats, refer to:
- Backend controllers in `server/src/`
- API routes in `app/api/`
- Schemas in `server/prisma/schema.prisma`

### Component Library
UI components are built using shadcn/ui with Radix UI primitives. Documentation:
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

## Contributing to Documentation

When updating features:

1. Update the relevant documentation file
2. Add examples for new functionality
3. Update code snippets to match current patterns
4. Add troubleshooting notes if applicable
5. Update the table of contents if adding new sections

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | March 2026 | Updated for Next.js 15, removed archived features |
| 1.5.0 | January 2026 | Added AI features, improved architecture docs |
| 1.0.0 | December 2025 | Initial documentation |

---

*For questions or contributions, please contact the development team.*
