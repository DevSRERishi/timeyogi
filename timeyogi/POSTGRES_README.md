# Task Management with PostgreSQL

This guide explains how to set up and use the Task Management application with a PostgreSQL database running in Docker.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js (if you want to run the backend or frontend separately)

## Quick Start

1. Clone this repository
2. Navigate to the project directory and run:
   ```
   docker-compose up -d
   ```
3. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5001/api/tasks
   - **pgAdmin**: http://localhost:5050 (email: admin@example.com, password: adminpassword)

## Architecture

The application consists of four main components:

1. **PostgreSQL Database**: Stores all task data
2. **Backend API**: Node.js/Express server that handles CRUD operations
3. **Frontend**: React application that provides the user interface
4. **pgAdmin**: Web-based PostgreSQL administration tool

## Services and Ports

| Service   | Container Name               | Port   | Description                    |
|-----------|------------------------------|--------|--------------------------------|
| PostgreSQL| task-management-postgres     | 5432   | Database server                |
| Backend   | task-management-backend      | 5001   | REST API for tasks             |
| Frontend  | task-management-frontend     | 3000   | React web application          |
| pgAdmin   | task-management-pgadmin      | 5050   | PostgreSQL administration tool |

## Database Details

- **Host**: localhost (or `postgres` from within Docker containers)
- **Port**: 5432
- **Database Name**: taskmanagement
- **Username**: taskuser
- **Password**: taskpassword

## Accessing pgAdmin

1. Open http://localhost:5050 in your browser
2. Login with:
   - Email: admin@example.com
   - Password: adminpassword
3. Register a new server:
   - Name: Task Management
   - Host: postgres
   - Port: 5432
   - Database: taskmanagement
   - Username: taskuser
   - Password: taskpassword

## API Endpoints

The backend provides the following RESTful API endpoints:

- **GET /api/tasks**: Get all tasks
- **GET /api/tasks/:id**: Get a specific task by ID
- **POST /api/tasks**: Create a new task
- **PUT /api/tasks/:id**: Update an existing task
- **DELETE /api/tasks/:id**: Delete a task

## Example API Usage

### Create a Task

```bash
curl -X POST http://localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "dueDate": "2025-03-19T00:00:00.000Z",
    "priority": "medium",
    "status": "todo",
    "category": "daily"
  }'
```

### Get All Tasks

```bash
curl http://localhost:5001/api/tasks
```

### Update a Task

```bash
curl -X PUT http://localhost:5001/api/tasks/YOUR_TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "priority": "high"
  }'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:5001/api/tasks/YOUR_TASK_ID
```

## Running Separately (Development)

### Start PostgreSQL only

```bash
docker-compose up -d postgres pgadmin
```

### Start Backend API (without Docker)

```bash
cd backend
npm install
npm run dev
```

### Start Frontend (without Docker)

```bash
npm install
npm start
```

## Troubleshooting

### Database Connection Issues

If the backend cannot connect to PostgreSQL, check:
1. Is the postgres container running? (`docker ps`)
2. Are you using the correct connection details?
3. Try to connect using pgAdmin to verify PostgreSQL is working

### Resetting the Database

To completely reset the database:

```bash
docker-compose down -v
docker-compose up -d
```

This will remove all volumes and start fresh.

### Checking Container Logs

To see what's happening in a container:

```bash
docker logs task-management-backend
docker logs task-management-postgres
docker logs task-management-frontend
```

## Database Schema

The application uses a single table called `tasks` with the following structure:

- **id**: UUID (primary key)
- **title**: String (required)
- **description**: Text (optional)
- **dueDate**: Date (optional)
- **priority**: Enum ('low', 'medium', 'high') (optional)
- **status**: Enum ('todo', 'in-progress', 'completed') (default: 'todo')
- **category**: Enum ('daily', 'weekly', 'monthly', 'yearly') (default: 'daily')
- **prevStatus**: Enum ('todo', 'in-progress') (optional)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp 