#!/bin/bash

# This script helps create the necessary databases for the new Broadsea services
# It uses sudo to run the commands as the postgres user to avoid authentication issues

echo "Creating databases and users for new Broadsea services..."

# Create a temporary SQL file with the commands
cat > /tmp/create-db.sql << EOF
-- SQL script to create databases and users for new Broadsea services

-- For Authentik
CREATE USER authentik WITH PASSWORD '4hkfPHHZ0is7wCc8sDDTrA==';
CREATE DATABASE authentik OWNER authentik;

-- For DataHub
CREATE USER datahub WITH PASSWORD 'o0zpJOwrA9Tt5AVNIpKiJw==';
CREATE DATABASE datahub OWNER datahub;

-- For Superset
CREATE USER superset WITH PASSWORD 'ESA372qdCyYWIf4tDvG0bQ==';
CREATE DATABASE superset OWNER superset;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE authentik TO authentik;
GRANT ALL PRIVILEGES ON DATABASE datahub TO datahub;
GRANT ALL PRIVILEGES ON DATABASE superset TO superset;
EOF

# Run the SQL commands as the postgres user
echo "Running SQL commands as postgres user (you may be prompted for your sudo password)..."
sudo -u postgres psql -f /tmp/create-db.sql

# Clean up
rm /tmp/create-db.sql

echo "Database setup complete!"
echo ""
echo "Now you can start the services with:"
echo "docker compose --profile authentik --profile portainer --profile datahub --profile superset up -d"
