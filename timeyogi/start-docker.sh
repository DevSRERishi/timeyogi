#!/bin/bash

echo "Starting Task Management app with PostgreSQL in Docker..."

# Build and start the containers
docker-compose up -d

echo "Containers are starting..."
echo "PostgreSQL will be available on localhost:5432"
echo "PgAdmin will be available on http://localhost:5050"
echo "Backend API will be available on http://localhost:5000"
echo "Frontend will be available on http://localhost:3000"
echo ""
echo "To stop the containers, run: docker-compose down" 