#!/bin/bash

# Setup database for Broadsea Content authentication
# This script creates the necessary tables in the PostgreSQL database if they don't exist

# Configuration
DB_USER=${1:-postgres}
DB_PASSWORD=${2:-acumenus}
DB_NAME=${3:-ohdsi}
DB_HOST=${4:-host.docker.internal}
DB_PORT=${5:-5432}
SCHEMA=${6:-basicauth}

# Display configuration
echo "Database configuration:"
echo "  Host:     $DB_HOST"
echo "  Port:     $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "  Schema:   $SCHEMA"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL client (psql) is not installed or not in PATH"
    exit 1
fi

# Always run the database setup script to ensure schema and data are up to date
echo "Creating/updating database schema and tables..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f /app/db-setup.sql

if [ $? -eq 0 ]; then
    echo "Database setup completed successfully!"
    echo "Default admin credentials: admin / admin123"
else
    echo "Error: Failed to set up database"
    exit 1
fi

echo "Starting application server..."
