#!/bin/bash
set -e

echo "🚀 ComparaVision Integration Deployment"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
}

# Check if Docker is installed (optional)
check_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker is available"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found. Will use local development mode."
        DOCKER_AVAILABLE=false
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    cd backend
    npm install
    cd ..
    
    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Check if environment files exist
    if [ ! -f "backend/env" ]; then
        print_warning "Backend environment file not found. Creating template..."
        cp backend/env backend/env.example 2>/dev/null || true
    fi
    
    if [ ! -f "frontend/env.local" ]; then
        print_warning "Frontend environment file not found. Creating template..."
        cp frontend/env.local frontend/env.local.example 2>/dev/null || true
    fi
    
    print_warning "Please configure your environment files:"
    print_warning "  - backend/env"
    print_warning "  - frontend/env.local"
    print_warning "Then run this script again with --configure flag"
}

# Build the application
build_app() {
    print_status "Building the application..."
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    print_success "Application built successfully"
}

# Start the application
start_app() {
    print_status "Starting the application..."
    
    # Start both frontend and backend
    npm run dev &
    
    print_success "Application started!"
    print_success "Frontend: http://localhost:3000"
    print_success "Backend: http://localhost:3001"
    print_success "Health Check: http://localhost:3001/health"
    
    # Wait for user input to stop
    echo ""
    print_status "Press Ctrl+C to stop the application"
    wait
}

# Docker deployment
deploy_docker() {
    if [ "$DOCKER_AVAILABLE" = false ]; then
        print_error "Docker is not available. Cannot deploy with Docker."
        exit 1
    fi
    
    print_status "Deploying with Docker..."
    
    # Build and start containers
    docker-compose up --build -d
    
    print_success "Docker deployment completed!"
    print_success "Frontend: http://localhost:3000"
    print_success "Backend: http://localhost:3001"
    print_success "Database: localhost:5432"
}

# Main deployment logic
main() {
    case "${1:-}" in
        "--docker")
            check_node
            check_docker
            deploy_docker
            ;;
        "--configure")
            setup_environment
            ;;
        "--build")
            check_node
            install_dependencies
            build_app
            ;;
        "--start")
            start_app
            ;;
        "--full")
            check_node
            check_docker
            install_dependencies
            setup_environment
            build_app
            start_app
            ;;
        *)
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Options:"
            echo "  --docker     Deploy using Docker"
            echo "  --configure  Setup environment files"
            echo "  --build      Build the application"
            echo "  --start      Start the application"
            echo "  --full       Full deployment (recommended)"
            echo ""
            echo "Examples:"
            echo "  $0 --full        # Complete setup and start"
            echo "  $0 --docker      # Deploy with Docker"
            echo "  $0 --configure   # Setup environment only"
            ;;
    esac
}

# Run main function
main "$@" 