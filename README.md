# Authentication & Authorization API

A secure Node.js/Express API with JWT-based authentication and role-based access control (RBAC) for managing posts.

## Features

- ✅ User registration and login with JWT tokens
- ✅ Access & refresh token mechanism
- ✅ CSRF protection
- ✅ Role-based permissions (admin, user, viewer)
- ✅ Resource ownership validation
- ✅ Input validation with Zod schemas
- ✅ Secure HTTP-only cookies

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Validation:** Zod
- **Authentication:** JWT (jsonwebtoken)
- **Database:** MongoDB (Mongoose)

## API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/refresh` | Refresh access token | Public |
| POST | `/logout` | Logout user | Required + CSRF |

### Posts Routes (`/posts`)

All post routes require authentication.

| Method | Endpoint | Description | Permission | Ownership |
|--------|----------|-------------|------------|-----------|
| GET | `/` | List all posts | `listPosts` | No |
| POST | `/` | Create new post | `createPost` | No |
| GET | `/:id` | Get single post | `viewPost` | No |
| PUT | `/:id` | Update post | `updatePost` | Yes |
| DELETE | `/:id` | Delete post | `deletePost` | Yes |

## Request/Response Examples

### Register User

**Request:**
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `name`: 1-50 characters
- `email`: 1-50 characters, valid email format
- `password`: 6-25 characters

### Login

**Request:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
Sets HTTP-only cookies with access and refresh tokens.

### Create Post

**Request:**
```bash
POST /posts
Content-Type: application/json
Cookie: accessToken=

{
  "title": "My First Post",
  "description": "This is a sample post description"
}
```

**Validation Rules:**
- `title`: minimum 5 characters
- `description`: maximum 250 characters

### Update Post

**Request:**
```bash
PUT /posts/:id
Content-Type: application/json
Cookie: accessToken=

{
  "title": "Updated Title"
}
```

**Note:** Both fields are optional for updates (partial schema).

## Middleware

### `requireAccessAuth`
Validates JWT access token from cookies and attaches user info to request.

**Adds to request:**
```typescript
req.authUser = {
  userId: string,
  role: string
}
```

### `requirePermission(action: string)`
Checks if user's role has permission to perform the specified action.

**Example:**
```typescript
router.get("/", requirePermission("listPosts"), listPosts);
```

### `requireOwnership`
Verifies that the user owns the resource (post) being modified, or is an admin.

**Rules:**
- Admins can modify any post
- Users can only modify their own posts

### `requireCsrf`
Validates CSRF token for state-changing operations.

## Role-Based Permissions

Permissions are defined in `PERMISSIONS` constant:

```typescript
PERMISSIONS = {
  admin: ["listPosts", "createPost", "viewPost", "updatePost", "deletePost"],
  user: ["listPosts", "createPost", "viewPost", "updatePost", "deletePost"],
  viewer: ["listPosts", "viewPost"]
}
```

### Role Capabilities

| Action | Admin | User | Viewer |
|--------|-------|------|--------|
| List posts | ✅ | ✅ | ✅ |
| View post | ✅ | ✅ | ✅ |
| Create post | ✅ | ✅ | ❌ |
| Update post | ✅ (any) | ✅ (own) | ❌ |
| Delete post | ✅ (any) | ✅ (own) | ❌ |

## Environment Variables

Create a `.env` file with:

```env
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

## Installation

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Error Handling

The API uses custom error classes:

- `UnauthorizedError` (401): Invalid or missing authentication
- `ForbiddenError` (403): Insufficient permissions or ownership
- `NotFoundError` (404): Resource not found
- Validation errors return 400 with Zod error details

## Security Features

- 🔒 HTTP-only cookies prevent XSS attacks
- 🔒 CSRF protection on state-changing operations
- 🔒 Password hashing (bcrypt)
- 🔒 JWT token expiration
- 🔒 Input validation and sanitization
- 🔒 Rate limiting on auth endpoints (recommended)

## License

MIT

## Contributing
Pull requests are welcome. For major changes, please open an issue first.