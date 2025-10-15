#!/bin/bash

# Aanaab AI Admin Panel Setup Script

echo "🚀 Setting up Aanaab AI Admin Panel..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual configuration values"
else
    echo "✅ .env.local already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "🗄️  Setting up database schema..."
npm run db:push

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your actual configuration values"
echo "2. Create an admin user in the database"
echo "3. Start the development server: npm run dev"
echo "4. Access the admin panel at http://localhost:3001"
echo ""
echo "To create an admin user, you can:"
echo "- Use Prisma Studio: npm run db:studio"
echo "- Or insert directly into the admin_users table"
echo ""
echo "Example admin user SQL:"
echo "INSERT INTO admin_users (id, email, name, password, role) VALUES ('admin-1', 'admin@example.com', 'Admin User', '\$2a\$10\$...', 'admin');"
echo ""
echo "Note: Make sure to hash the password with bcrypt before inserting."
