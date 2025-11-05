# Mira Medical Patient Intake System - Backend API

A **simple, clean** Node.js/Express API boilerplate for building medical patient intake systems with authentication, role-based permissions, file management, and background jobs.

## Tech Stack

- **Runtime**: Node.js with Babel for ES6+ features
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with Passport.js
- **Authorization**: Simple role-based ACL with express-acl
- **File Storage**: AWS S3 or local storage with Multer
- **Background Jobs**: Bull queues with Redis
- **Real-time**: WebSocket support
- **Email**: Nodemailer with Handlebars templates

## What's Included

✅ **User Authentication** - Signup, signin with JWT tokens
✅ **Role-Based Access Control** - Simple express-acl configuration
✅ **File Uploads** - AWS S3 or local storage
✅ **Background Jobs** - Bull queue system with Redis
✅ **Email System** - Nodemailer with Handlebars templates
✅ **WebSocket** - Real-time updates
✅ **Clean Structure** - Feature-based routing with decorators
✅ **Example Files** - Migration, seeder, and template examples

## Prerequisites

- Node.js >= 14.x
- PostgreSQL >= 12.x
- Redis (for background job queues)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .envtemplate .env
# Edit .env with your database credentials and secrets
```

### 3. Setup Database

```bash
# Create database
createdb mira_db

# Run migrations
npx sequelize-cli db:migrate

# (Optional) Seed demo admin user
npx sequelize-cli db:seed:all
# Credentials: admin@example.com / admin123
```

### 4. Create Upload Directory

```bash
mkdir -p public/uploads
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Development server with hot reload
- `npm start` - Production server
- `npm run build` - Build for production
- `npm run lint:eslint` - Lint code
- `npm run lint:eslint:fix` - Auto-fix linting issues

## Project Structure

```
src/
├── routes/
│   └── user/                   # User routes (signup, signin, profile)
│       ├── user.controller.js  # Route handlers
│       ├── query.js            # Database queries
│       └── validationSchemas.js # Joi validation
├── models/
│   ├── user.model.js           # User model
│   ├── fileResource.js         # File upload model
│   └── index.js                # Model associations
├── middlewares/                # Auth, permissions, uploads, errors
├── lib/                        # Core libraries (WebSocket)
├── utils/                      # Helpers, constants, queues, decorators
├── config/
│   ├── config.js               # Database config
│   ├── acl.js                  # Simple ACL configuration
│   └── passport.js             # Passport strategies
├── migrations/                 # Database migrations (1 example)
├── seeders/                    # Database seeds (1 example)
├── templates/                  # Email templates (1 example)
└── server.js                   # Entry point
```

## Authentication & Authorization

### Authentication (JWT)
- User signup/signin with email and password
- JWT tokens for authenticated requests
- Passport.js local strategy

### Authorization (Express ACL)
Simple role-based permissions configured in `src/config/acl.js`:

```javascript
{
  group: 'admin',
  permissions: [
    { resource: '*', methods: '*', action: 'allow' }
  ]
},
{
  group: 'user',
  permissions: [
    { resource: '/users/profile', methods: ['GET', 'PUT'], action: 'allow' }
  ]
}
```

**Available Roles**: admin, user, patient (extendable)

## Building Features

### Example: Adding Patient Management

1. **Create Model** (`src/models/patient.model.js`)
2. **Create Migration** (`npx sequelize-cli migration:generate --name create-patient`)
3. **Create Routes** (`src/routes/patient/`)
4. **Update ACL** (add patient permissions in `src/config/acl.js`)
5. **Register Route** (in `src/routes/index.js`)

See [BOILERPLATE.md](BOILERPLATE.md) for detailed step-by-step guide.

## Configuration

### Environment Variables
Key variables in `.env`:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Secret for JWT signing
- `PORT` - Server port (default: 3000)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - For S3 uploads
- `REDIS_URL` - Redis for job queues

### Adding New Roles
Edit `src/utils/constants.js`:
```javascript
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  PATIENT: 'patient',
  DOCTOR: 'doctor',    // Add new role
};
```

Then update `src/config/acl.js` with role permissions.

## Background Jobs

Bull queues handle async tasks:
- `DEFAULT_QUEUE` - General background processing
- `NOTIFICATION_QUEUE` - Email notifications
- `CLEANUP_QUEUE` - File cleanup

Define job types in `src/utils/constants.js`

## Example Files

Learn from these examples:
- **Migration**: `src/migrations/20210301081630-create-user.js`
- **Seeder**: `src/seeders/20210202112802-demo-user.js`
- **Email Template**: `src/templates/general.hbs`

## Documentation

- [CLAUDE.md](CLAUDE.md) - Architecture and development guide
- [BOILERPLATE.md](BOILERPLATE.md) - How to build medical features

## Author

Syed Ali Hamza - hamza.syed9995@gmail.com

## License

ISC
