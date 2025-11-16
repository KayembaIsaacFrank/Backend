
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
