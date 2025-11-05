# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mira Medical Patient Intake System Backend** - Express.js API boilerplate for building medical patient intake systems with JWT authentication, file management, background jobs, and real-time notifications.

**Tech Stack**: Node.js, Express, MSSQL (SQL Server), Sequelize, JWT Auth, Bull Queues, WebSocket, AWS S3

**Current Status**: Basic boilerplate with working user authentication. ACL/permissions system has been removed. Only User model exists.

**Database**: MSSQL (SQL Server 2022) with database `mira_local`, credentials configured in `.env`

## Development Commands

### Running the Application
```bash
npm run dev              # Development server with nodemon on port 3000 (Windows: uses set DEBUG)
npm start                # Production start with babel-node
npm run start:prod       # Production with PM2
npm run build            # Compile with Babel to dist/
```

### Database Operations
```bash
# Setup: Rename .envtemplate to .env and configure MSSQL credentials
npx sequelize-cli db:migrate           # Run migrations
npx sequelize-cli db:seed:all          # Seed database
npx sequelize-cli migration:generate --name <name>  # Create migration
```

### Linting
```bash
npm run lint:eslint      # Lint code
npm run lint:eslint:fix  # Auto-fix lint issues
```

## Architecture

### Request Flow
1. **Entry Point**: `src/server.js` → creates HTTP server with WebSocket support, loads dotenv config
2. **App Setup**: `src/app.js` → configures Express middleware, routes
3. **Routes**: `src/routes/index.js` → central router with JWT auth middleware
4. **Controllers**: Feature-based in `src/routes/<feature>/<feature>.controller.js`
5. **Models**: Sequelize models in `src/models/` (currently only User model exists)

### Directory Structure
```
src/
├── routes/<feature>/       # Feature-based routing
│   ├── <feature>.controller.js  # Route handlers & business logic
│   ├── query.js                 # Complex Sequelize queries
│   └── validationSchemas.js     # Joi validation schemas
├── models/                 # Sequelize models (User only)
├── middlewares/            # Auth, upload, error handling
│   ├── auth.js            # JWT token extraction and validation
│   ├── errorHandler.js    # Centralized error handling
│   └── upload.js          # Multer file upload middleware
├── lib/                    # Core libraries (ACL, WebSocket)
├── utils/                  # Helpers, constants, decorators, queues
├── config/                 # Database, passport, Redis config
├── migrations/             # Sequelize migrations
├── seeders/                # Database seeds
├── templates/              # Email templates (Handlebars)
└── server.js               # Entry point with dotenv import
```

### Key Patterns

**Controllers**: Use decorator pattern for validation and request handling
```javascript
// Static methods with decorators
@RequestBodyValidator(validationSchema)
@Request
static async updateUser(req, res) { ... }

// Note: Decorators accept Joi schemas directly and call schema.validate(req.body)
```

**Authentication**: JWT tokens via `express-jwt`
- Routes excluded from auth listed in `aclExcludedRoutes` in `src/routes/index.js`
- JWT secret loaded from `.env` via dotenv (imported at top of `src/server.js`)
- Token must be in `Authorization: Bearer <token>` header
- Login endpoint: `POST /api/users/login` (excluded from auth)

**Authorization**: Currently simplified - no ACL/groups/permissions system
- Only basic JWT authentication is active
- For production: Add role-based checks in controllers or middleware

**Validation**: Joi schemas for request validation
- Schemas defined in `validationSchemas.js` files
- Used with `@RequestBodyValidator` decorator
- Modern Joi API: use `schema.validate()` not `Joi.validate()`

**Error Handling**: Centralized in `src/middlewares/errorHandler.js`
- Handles GeneralError instances
- Handles Sequelize errors (foreign key, unique constraints)
- Maps to appropriate HTTP status codes

**Background Jobs**: Bull queues with Redis
- `QUEUE_NAMES`: DEFAULT_QUEUE, NOTIFICATION_QUEUE, CLEANUP_QUEUE
- Define job types in `src/utils/constants.js`

**WebSocket**: Real-time updates
- Server: `src/server.js` creates WebSocket server
- Messages defined in `WS_MESSAGES` constant

### Database

**ORM**: Sequelize v6.37.7 with MSSQL (tedious v18.6.1)
- Configuration: `src/config/config.js` (uses MSSQL dialect)
- Connection: SQL Server 2022, database `mira_local`, sa/admin credentials
- TCP/IP protocol and SQL Server Authentication must be enabled
- Migrations run via sequelize-cli

**Current Models**:
- **User** only (see `src/models/user.model.js`)
- Fields: id, firstName, lastName, email, password, isAdmin, contactNo, extension, role, status, lastActivity, avatar, joiningDate, dob, loginTime
- Virtual field: fullName (computed from firstName + lastName)
- Password hashing: Uses `crypto.pbkdf2Sync` with salt from env (NOT bcrypt)

**Removed Models**: Location, Department, Title, Group, Resource, FileResource, Document, Notification, UserGroup, UserAssignedLocation

### File Uploads

Uses `multer` with S3 or local storage
- Middleware: `src/middlewares/upload.js`
- Storage: AWS S3 or local `/public/uploads`
- Cleanup queue removes unused files

## Important Notes

- **Environment Variables**: Must add `import 'dotenv/config'` at top of `src/server.js` for JWT_SECRET to load
- **Password Hashing**: Uses `crypto.pbkdf2Sync()` with `process.env.SALT` - NOT bcrypt
- **Main Branches**: Both `main` and `master` are synced and contain same code
- **Babel**: Uses Babel for ES6+ features; dev uses babel-node with `--inspect` flag
- **Debugging**: Set `DEBUG=api:*` environment variable (Windows: `set DEBUG=api:*`)
- **Windows Development**: Commands use `set` for env vars (not `export`)
- **Port Management**: Use `npx kill-port 3000` to kill port if needed
- **No Comments**: User requirement - do not add comments to code

## Current API Endpoints

All endpoints under `/api/users`:

### Public (No Auth Required)
- **POST /api/users/login** - Login with email/password, returns JWT token
- **POST /api/users** - Create new user (temporarily excluded for testing)

### Protected (Requires JWT)
- **GET /api/users** - List all users with pagination
- **GET /api/users/:id** - Get user by ID
- **PUT /api/users/:id** - Update user

## Common Workflows

### Adding a New Feature/Resource
1. Create directory: `src/routes/<feature>/`
2. Add controller with static methods and decorators (see `src/routes/user/` example)
3. Create query file for complex Sequelize queries
4. Add validation schemas using Joi (use modern `schema.validate()` API)
5. Create Sequelize model in `src/models/` with ES6 class and static `associate()` method
6. Add migration: `npx sequelize-cli migration:generate --name create-feature`
7. Register route in `src/routes/index.js` using `router.use()`
8. Add to `aclExcludedRoutes` if public endpoint

### Example Files (Use as Templates)
- **Migration**: `src/migrations/20210301081630-create-user.js`
- **Seeder**: `src/seeders/20210202112802-demo-user.js`
- **Model**: `src/models/user.model.js`
- **Controller**: `src/routes/user/user.controller.js`
- **Query**: `src/routes/user/query.js`
- **Validation**: `src/routes/user/validationSchemas.js`
- **Template**: `src/templates/general.hbs`

### Creating a Migration
```bash
npx sequelize-cli migration:generate --name create-patients

# Edit the generated file in src/migrations/
# Use Sequelize DataTypes: INTEGER, STRING, DATE, DATEONLY, ENUM, BOOLEAN, TEXT
# MSSQL specific: createdAt/updatedAt/deletedAt as DATE type
```

### Working with Decorators
```javascript
// RequestBodyValidator: Pass Joi schema directly
@RequestBodyValidator(userUpdateSchema)
@Request
static async updateUser(req, res) { ... }

// The decorator calls schema.validate(req.body) internally
// Throws BadRequestError if validation fails
```

### Working with Queries
```javascript
// Define reusable query builders in query.js
export const listQuery = ({ searchString, pageNumber, pageSize }) => {
  const query = { where: {} };
  if (searchString) {
    query.where[Op.or] = [
      { email: { [Op.like]: `%${searchString}%` } }
    ];
  }
  query.offset = (pageNumber - 1) * pageSize;
  query.limit = pageSize;
  return query;
};

// Use in controller
const users = await User.findAndCountAll(listQuery(req.query));
```

## Medical Intake System Guidance

This boilerplate is ready for customization into a medical patient intake system. Consider building:

- **Patient Model & Routes**: Store patient demographics, contact info, medical history
- **Intake Form**: Multi-step forms for medical history, insurance, consent
- **Appointment Scheduling**: Calendar integration, provider availability
- **Document Management**: Store consent forms, insurance cards, medical records
- **HIPAA Compliance**: Encryption, audit logs, access controls
- **EHR Integration**: HL7/FHIR interfaces for existing systems
- **Notification System**: Appointment reminders, intake form completion alerts

Update `src/utils/constants.js` with medical-specific roles (PATIENT, DOCTOR, NURSE, etc.)

## Troubleshooting

### Common Issues

**"Cannot read properties of undefined"**
- Check if all imported constants exist in `src/utils/constants.js`
- Verify middleware files exist and exports are correct

**"No authorization token was found"**
- Add route to `aclExcludedRoutes` in `src/routes/index.js`
- Or include `Authorization: Bearer <token>` header

**"Invalid credentials"**
- Ensure password hashing matches (crypto.pbkdf2Sync with SALT env var)
- Check user exists in database with correct email

**Database connection fails**
- Verify SQL Server 2022 is running
- Check TCP/IP protocol is enabled in SQL Server Configuration Manager
- Verify SQL Server Authentication is enabled
- Test connection string in `.env`

**Environment variables not loading**
- Ensure `import 'dotenv/config'` is first line in `src/server.js`
- Check `.env` file exists and has correct format

## Author

Syed Ali Hamza - hamza.syed9995@gmail.com
