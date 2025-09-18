#!/bin/bash

# CivicSense Supabase Database Setup Script
# This script will help you set up your Supabase database

echo "🚀 CivicSense Supabase Database Setup"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f "Server/.env" ]; then
    echo "📝 Creating .env file..."
    cat > Server/.env << 'EOF'
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_make_it_long_and_random

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Go to https://supabase.com and create a new project"
echo "2. Copy your project credentials from Settings → API"
echo "3. Edit Server/.env file and replace the placeholder values:"
echo "   - SUPABASE_URL: Your project URL"
echo "   - SUPABASE_ANON_KEY: Your anon public key"
echo "   - SUPABASE_SERVICE_ROLE_KEY: Your service role key"
echo "   - JWT_SECRET: Generate a random secret key"
echo ""
echo "4. Run the database setup SQL script in Supabase SQL Editor"
echo "5. Test the connection by running: npm run dev"
echo ""
echo "📁 Database files available:"
echo "   - complete_database_setup.sql (Main schema)"
echo "   - supabase_sample_data.sql (Sample data)"
echo "   - database_improvements.sql (Additional improvements)"
echo ""
echo "🔧 To generate a JWT secret, run:"
echo "   node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
echo ""
echo "Happy coding! 🎉"
