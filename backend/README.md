# GCDL Backend Setup

## Installation

1. Navigate to the backend folder:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update `.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=gcdl_db
   JWT_SECRET=your_secret_key
   ```

4. Initialize the database:
   ```
   node initDb.js
   ```

5. Start the server:
   ```
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The server will run on http://localhost:5000

## API Endpoints

- POST /api/auth/ceo-signup - CEO signup
- POST /api/auth/login - User login
- POST /api/auth/create-manager - CEO creates manager
- POST /api/auth/create-agent - Manager creates sales agent
