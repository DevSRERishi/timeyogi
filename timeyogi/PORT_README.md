# Running the Task Management App on Port 3000

This README provides instructions on how to ensure the Task Management application always runs on port 3000.

## Option 1: Using the Start Scripts

### For macOS/Linux Users:
1. Open a terminal in the project directory
2. Run the start script:
   ```
   ./start.sh
   ```
   This script will:
   - Check if any process is running on port 3000
   - Kill that process if found
   - Start the React app on port 3000

### For Windows Users:
1. Open a command prompt in the project directory
2. Run the start script:
   ```
   start-windows.bat
   ```
   This script will:
   - Check if any process is running on port 3000
   - Kill that process if found
   - Start the React app on port 3000

## Option 2: Using npm start

The `package.json` file has been configured to always use port 3000. Simply run:
```
npm start
```

This will start the app on port 3000, but it will not automatically kill any existing process on that port. If port 3000 is already in use, you'll need to manually kill that process first.

## Option 3: Manual Process Management

### For macOS/Linux:
```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process (replace PID with the actual process ID)
kill -9 PID

# Start the app on port 3000
PORT=3000 npm start
```

### For Windows:
```cmd
# Find the process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual process ID)
taskkill /F /PID PID

# Start the app on port 3000
set PORT=3000
npm start
```

## Troubleshooting

If you're still having issues with port 3000:

1. Check if any other application is using port 3000 (like another React app)
2. Restart your computer to clear any lingering processes
3. Try running the app with administrator/sudo privileges 