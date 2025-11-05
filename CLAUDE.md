# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mira Medical Patient Intake System Backend** - Express.js API boilerplate for building medical patient intake systems with authentication, authorization (ACL), file management, background jobs, and real-time notifications.

**Tech Stack**: Node.js, Express, PostgreSQL, Sequelize, JWT Auth, Bull Queues, WebSocket, AWS S3

**Status**: This is a BOILERPLATE project. Business logic has been removed. Use the example files as patterns for building your medical intake features.

## Development Commands

### Running the Application
```bash
npm run dev              # Development server with nodemon on port 3000
npm start                # Production start with babel-node
npm run start:prod       # Production with PM2
npm run build            # Compile with Babel to dist/
```

### Database Operations
```bash
# Setup: Rename .envtemplate to .env and configure DB credentials
npx sequelize-cli db:migrate           # Run migrations
npx sequelize-cli db:seed:all          # Seed database
npx sequelize-cli migration:generate --name <name>  # Create migration
npm run migration:scripts <feature>    # Run custom scripts
```

### Testing & Linting
```bash
npm test                 # Run all Jest tests
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode
npm run lint:eslint      # Lint code
npm run lint:eslint:fix  # Auto-fix lint issues
```

## Architecture

### Request Flow
1. **Entry Point**: `src/server.js` → creates HTTP server with WebSocket support
2. **App Setup**: `src/app.js` → configures Express middleware, routes
3. **Routes**: `src/routes/index.js` → central router applying auth, permissions, ACL
4. **Controllers**: Feature-based in `src/routes/<feature>/<feature>.controller.js`
5. **Models**: Sequelize models in `src/models/`

### Directory Structure
```
src/
├── routes/<feature>/       # Feature-based routing
│   ├── <feature>.controller.js  # Route handlers & business logic
│   ├── query.js                 # Complex Sequelize queries
│   └── validationSchemas.js     # Joi validation schemas
├── models/                 # Sequelize models with associations
├── middlewares/            # Auth, permissions, upload, error handling
├── lib/                    # Core libraries (ACL, WebSocket)
├── utils/                  # Helpers, constants, decorators, queues
├── config/                 # Database, passport, Redis config
├── migrations/             # Sequelize migrations (1 example included)
├── seeders/                # Database seeds (1 example included)
├── scripts/                # Custom migration scripts
├── templates/              # Email templates (Handlebars)
└── test/                   # Jest tests (1 example included)
```

### Key Patterns

**Controllers**: Use decorator pattern for validation and request handling
```javascript
@Request('/path', 'METHOD')
@RequestBodyValidator(validationSchema)
async methodName(req, res, next) { ... }
```

**Authentication**: JWT tokens via `express-jwt` and Passport.js
- Routes excluded from auth listed in `aclExcludedRoutes` in `src/routes/index.js`
- JWT secret configured in `.env`

**Authorization**: ACL system using `accesscontrol` library
- Permissions loaded from database on startup
- Middleware checks permissions via `handlePermissions`
- Permissions: `readAny`, `createAny`, `updateAny`, `deleteAny`, `readOwn`, `updateOwn`
- Resources defined by slugs in `src/utils/constants.js` FEATURES array

**Background Jobs**: Bull queues with Redis
- `defaultQueue` - General background processing
- `notificationQueue` - Email and in-app notifications
- `cleanupQueue` - Asset cleanup (images, files)
- Define job types in `src/utils/constants.js`

**WebSocket**: Real-time updates for notifications, permissions, user status
- Server: `src/server.js` creates WebSocket server
- Messages defined in `WS_MESSAGES` constant

### Database

**ORM**: Sequelize 6.x with PostgreSQL
- Configuration: `src/config/config.js`
- Schema support for multi-tenancy via `SCHEMA_NAME` env variable
- Migrations run via sequelize-cli
- Models use ES6 classes with static associations

**Example Models Included**:
- User, Group, Department, Location, Title
- Document, FileResource, Resource, Notification
- UserGroup, UserAssignedLocation (junction tables)

### File Uploads

Uses `multer` with S3 or local storage
- Middleware: `src/middlewares/upload.js`
- Storage: AWS S3 or local `/public/uploads`
- Cleanup queue removes unused files

### Testing

Jest with integration tests in `src/test/integrations/`
- Config: `jest.config.js`
- Example test included as pattern
- Use `--detectOpenHandles` flag for debugging

## Important Notes

- **Boilerplate Status**: Example files marked with "BOILERPLATE EXAMPLE" comments
- **Main Branch**: `develop` (not master/main)
- **Environment**: Requires `.env` file (see `.envtemplate`)
- **Babel**: Uses Babel for ES6+ features; dev uses babel-node
- **Debugging**: Set `DEBUG=api:*` environment variable
- **PM2**: Use `pm2 install pm2-logrotate` for log rotation

## Common Workflows

### Adding a New Feature/Resource
1. Create directory: `src/routes/<feature>/`
2. Add controller with router methods (see `src/routes/user/` example)
3. Create query file for complex queries
4. Add validation schemas using Joi
5. Create Sequelize model in `src/models/`
6. Add migration: `npx sequelize-cli migration:generate --name create-feature`
7. Register route in `src/routes/index.js`
8. Update ACL resources in `src/utils/constants.js` if needed
9. Add tests in `src/test/integrations/`

### Example Files (Use as Templates)
- **Migration**: `src/migrations/20210301081630-create-user.js`
- **Seeder**: `src/seeders/20210202112802-demo-user.js`
- **Model**: `src/models/user.model.js`
- **Route**: `src/routes/user/`
- **Template**: `src/templates/general.hbs`
- **Test**: `src/test/integrations/example.test.js`

### Modifying Permissions
1. Update `FEATURES` array in `src/utils/constants.js`
2. Create migration to update database
3. Restart server to reload ACL

### Working with Queues
1. Define queue names in `QUEUE_NAMES` constant
2. Define job names in `DEFAULT_QUEUE_JOB_NAMES` constant
3. Add queue processors in `src/utils/queues/`
4. Dispatch jobs from controllers

## Medical Intake System Guidance

This boilerplate is ready for customization into a medical patient intake system. Consider building:

- **Patient Model & Routes**: Store patient demographics, contact info
- **Intake Form**: Multi-step forms for medical history, insurance, consent
- **Appointment Scheduling**: Calendar integration, provider availability
- **Document Management**: Store consent forms, insurance cards, medical records
- **HIPAA Compliance**: Encryption, audit logs, access controls
- **EHR Integration**: HL7/FHIR interfaces for existing systems
- **Notification System**: Appointment reminders, intake form completion alerts

Update `src/utils/constants.js` with medical-specific roles, resources, and permissions.

## Author

Syed Ali Hamza - hamza.syed9995@gmail.com
