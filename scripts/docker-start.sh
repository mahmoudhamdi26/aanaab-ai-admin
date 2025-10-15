#!/bin/bash
# Admin Panel Startup Script for Docker

set -e

echo "🚀 Starting Admin Panel..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h ai-postgres -p 5432 -U ai_service -d aanaab_ai; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "✅ Database is ready!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📊 Pushing database schema..."
npx prisma db push

# Seed the database with default configurations
echo "🌱 Seeding database with default configurations..."
npm run seed

# Start the development server
echo "🎉 Starting Next.js development server..."
exec npm run dev
