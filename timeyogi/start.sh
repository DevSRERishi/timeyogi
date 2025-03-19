#!/bin/bash

# Find and kill any process running on port 3000
echo "Checking for processes running on port 3000..."
PID=$(lsof -ti:3000)

if [ -n "$PID" ]; then
  echo "Found process with PID $PID running on port 3000. Killing it..."
  kill -9 $PID
  echo "Process killed."
else
  echo "No process found running on port 3000."
fi

# Start the React app on port 3000
echo "Starting React app on port 3000..."
PORT=3000 npm start 