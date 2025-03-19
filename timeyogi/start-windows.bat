@echo off
echo Checking for processes running on port 3000...

:: Find and kill any process running on port 3000
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') DO (
  echo Found process with PID %%P running on port 3000. Killing it...
  taskkill /F /PID %%P
  echo Process killed.
)

:: Start the React app on port 3000
echo Starting React app on port 3000...
set PORT=3000
npm start 