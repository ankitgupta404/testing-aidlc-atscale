#!/bin/bash
# Init script for Canopy Project Management App

set -e

echo "🌲 Setting up Canopy..."

# Install shared deps
echo "📦 Installing shared dependencies..."
cd shared && npm install --silent && cd ..

# Install backend deps
echo "📦 Installing backend dependencies..."
cd backend && npm install --silent && cd ..

# Install infrastructure deps
echo "📦 Installing infrastructure dependencies..."
cd infrastructure && npm install --silent && cd ..

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd frontend && npm install --silent && cd ..

# Start frontend dev server
echo "🚀 Starting frontend dev server on port 6174..."
cd frontend && npx vite --host 0.0.0.0 --port 6174
