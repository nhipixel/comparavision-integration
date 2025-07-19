# Auth0 Login with Supabase

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## Setup Instructions

1. Clone the repository
```bash
git clone <repository-url>
cd auth0_login
```

2. Create a `.env` file in the root directory with these values:
```properties
REACT_APP_SUPABASE_URL=https://xoodnuckjmlmejeyyneg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2RudWNram1sbWVqZXl5bmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTQwNTQsImV4cCI6MjA2ODQ5MDA1NH0.tu12RS2PsuKvewIEaCXI2eMyLMOYuZi8gSBe6nIPN2s
NODE_ENV=development
PORT=3000
```

3. Install dependencies
```bash
npm install
```

4. Start the development server
```bash
npm run dev
```

## Port Configuration
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Common Issues & Solutions

1. Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

2. Dependencies issues
```bash
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
rm -rf node_modules
npm install
```

3. Database Connection Issues
- Verify your Supabase URL and key in .env
- Check if Supabase service is running
- Ensure your IP is whitelisted in Supabase dashboard

## Project Structure
```
auth0_login/
├── src/
│   ├── lib/
│   │   └── supabase.js   # Supabase client configuration
│   └── App.js            # Main application component
├── server.js             # Express backend server
├── .env                  # Environment variables
└── package.json          # Project dependencies
```

## Available Scripts
- `npm run dev`: Start both frontend and backend
- `npm run client`: Start only frontend
- `npm run server`: Start only backend
- `npm run build`: Build for production

## Support
Contact team lead for access to:
- Supabase dashboard
- Database credentials
- Auth0 configuration

## Security Notes
- Never commit .env file
- Keep Supabase keys private
- Use proper authentication
