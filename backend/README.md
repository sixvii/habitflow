# ProHabit Backend API

Backend API for ProHabit - A habit tracking application built with Express.js, Node.js, and MongoDB.

## Features

- 🔐 User authentication with JWT
- ✅ Task/Habit management with CRUD operations
- 📊 Categories for organizing tasks
- 📈 Analytics and statistics
- 🔥 Streak tracking
- 📅 Completion history
- 🗓️ Heatmap data for visualizations

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/prohabit
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

4. Make sure MongoDB is running on your system

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `PUT /api/users/preferences` - Update user preferences (Protected)
- `DELETE /api/users/account` - Delete user account (Protected)

### Tasks
- `GET /api/tasks` - Get all tasks (Protected)
- `POST /api/tasks` - Create a new task (Protected)
- `GET /api/tasks/:id` - Get a single task (Protected)
- `PUT /api/tasks/:id` - Update a task (Protected)
- `PATCH /api/tasks/:id/complete` - Toggle task completion (Protected)
- `DELETE /api/tasks/:id` - Delete a task (Protected)

### Categories
- `GET /api/categories` - Get all categories (Protected)
- `POST /api/categories` - Create a new category (Protected)
- `GET /api/categories/:id` - Get a single category (Protected)
- `PUT /api/categories/:id` - Update a category (Protected)
- `DELETE /api/categories/:id` - Delete a category (Protected)

### Analytics
- `GET /api/analytics/overview` - Get analytics overview (Protected)
- `GET /api/analytics/history` - Get completion history (Protected)
- `GET /api/analytics/streaks` - Get streak statistics (Protected)
- `GET /api/analytics/heatmap` - Get heatmap data (Protected)

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── userController.js  # User management logic
│   ├── taskController.js  # Task management logic
│   ├── categoryController.js # Category management logic
│   └── analyticsController.js # Analytics logic
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User model
│   ├── Task.js            # Task model
│   └── Category.js        # Category model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User routes
│   ├── tasks.js           # Task routes
│   ├── categories.js      # Category routes
│   └── analytics.js       # Analytics routes
├── .env.example           # Environment variables example
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
├── server.js             # Main server file
└── README.md             # This file
```

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

## Database Models

### User
- email (unique)
- password (hashed)
- name
- avatar
- preferences (theme, notifications, reminderTime)

### Task
- title
- description
- category (reference)
- user (reference)
- isCompleted
- completedAt
- dueDate
- priority
- isRecurring
- recurrencePattern
- streak tracking
- completionHistory

### Category
- name
- color
- icon
- user (reference)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC
