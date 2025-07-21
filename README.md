# ComparaVision Integration

Vision Model Performance Comparison Platform - Full Stack Integration

## Quick Start

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Environment Setup

**Frontend** (`frontend/env.local`):
```properties
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Backend** (`backend/env`):
```properties
PORT=3001
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
CORS_ORIGIN=http://localhost:3000
```

## Deployment

```bash
# Docker deployment
docker-compose up --build -d

# Production build
npm run build
npm run start:backend
npm run start:frontend
```

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Express.js, Node.js
- **Database**: Supabase
- **AI Processing**: RunPod
- **Deployment**: Docker, Docker Compose

## API Endpoints

- `GET /health` - Health check
- `GET /test-db` - Database connection test
- `POST /api/auth/register` - User registration
- `GET /api/auth/user/:id` - Get user profile
- `POST /api/models/upload` - Upload AI models
- `POST /api/comparisons` - Create model comparisons

## Project Structure

```
comparavision-integration/
├── frontend/          # Next.js frontend
├── backend/           # Express.js backend
├── docker-compose.yml # Docker configuration
├── deploy.sh          # Deployment script
└── package.json       # Root package.json
```

