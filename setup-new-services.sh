#!/bin/bash

# Setup script for new Broadsea services
# This script will create the necessary directories and secret files for:
# - Authentik
# - Portainer
# - DataHub
# - Superset

set -e

echo "Setting up new services for Broadsea..."

# Create directories if they don't exist
mkdir -p secrets/authentik
mkdir -p secrets/portainer
mkdir -p secrets/datahub
mkdir -p secrets/superset

# Generate random passwords
AUTHENTIK_PG_PASSWORD=$(openssl rand -base64 16)
AUTHENTIK_SECRET_KEY=$(openssl rand -base64 32)
PORTAINER_ADMIN_PASSWORD=$(openssl rand -base64 16)
DATAHUB_PG_PASSWORD=$(openssl rand -base64 16)
DATAHUB_NEO4J_PASSWORD=$(openssl rand -base64 16)
SUPERSET_PG_PASSWORD=$(openssl rand -base64 16)
SUPERSET_SECRET_KEY=$(openssl rand -base64 32)

# Create secret files
echo "$AUTHENTIK_PG_PASSWORD" > secrets/authentik/AUTHENTIK_POSTGRES_PASSWORD
echo "$AUTHENTIK_SECRET_KEY" > secrets/authentik/AUTHENTIK_SECRET_KEY
echo "$PORTAINER_ADMIN_PASSWORD" > secrets/portainer/PORTAINER_ADMIN_PASSWORD
echo "$DATAHUB_PG_PASSWORD" > secrets/datahub/DATAHUB_POSTGRES_PASSWORD
echo "$SUPERSET_PG_PASSWORD" > secrets/superset/SUPERSET_POSTGRES_PASSWORD
echo "$SUPERSET_SECRET_KEY" > secrets/superset/SUPERSET_SECRET_KEY

# Add new sections to .env file if they don't exist
if ! grep -q "Authentik Configuration" .env; then
  cat << EOF >> .env

############################################################################################################################################################
# Section 19:
# Authentik Configuration
############################################################################################################################################################

# Authentik Database Configuration
AUTHENTIK_POSTGRES_HOST="localhost"
AUTHENTIK_POSTGRES_PORT="5432"
AUTHENTIK_POSTGRES_DB="authentik"
AUTHENTIK_POSTGRES_USER="authentik"
AUTHENTIK_POSTGRES_PASSWORD_FILE="./secrets/authentik/AUTHENTIK_POSTGRES_PASSWORD"

# Authentik Application Configuration
AUTHENTIK_SECRET_KEY_FILE="./secrets/authentik/AUTHENTIK_SECRET_KEY"
AUTHENTIK_ERROR_REPORTING="false"
AUTHENTIK_DISABLE_UPDATE_CHECK="true"

# Authentik SAML Configuration
AUTHENTIK_SAML_ENABLED="true"
AUTHENTIK_SAML_ISSUER="https://\${BROADSEA_HOST}/authentik/saml/metadata/"
AUTHENTIK_SAML_SIGNING_CERT="/etc/authentik/certs/saml-signing.crt"
AUTHENTIK_SAML_SIGNING_KEY="/etc/authentik/certs/saml-signing.key"

# Authentik Email Configuration
AUTHENTIK_EMAIL_HOST=""
AUTHENTIK_EMAIL_PORT="25"
AUTHENTIK_EMAIL_USERNAME=""
AUTHENTIK_EMAIL_PASSWORD=""
AUTHENTIK_EMAIL_USE_TLS="false"
AUTHENTIK_EMAIL_USE_SSL="false"
AUTHENTIK_EMAIL_FROM="authentik@\${BROADSEA_HOST}"
EOF
fi

if ! grep -q "Portainer Configuration" .env; then
  cat << EOF >> .env

############################################################################################################################################################
# Section 20:
# Portainer Configuration
############################################################################################################################################################

# Portainer Admin Configuration
PORTAINER_ADMIN_PASSWORD_FILE="./secrets/portainer/PORTAINER_ADMIN_PASSWORD"
EOF
fi

if ! grep -q "DataHub Configuration" .env; then
  cat << EOF >> .env

############################################################################################################################################################
# Section 21:
# DataHub Configuration
############################################################################################################################################################

# DataHub Database Configuration
DATAHUB_POSTGRES_HOST="localhost"
DATAHUB_POSTGRES_PORT="5432"
DATAHUB_POSTGRES_DB="datahub"
DATAHUB_POSTGRES_USER="datahub"
DATAHUB_POSTGRES_PASSWORD_FILE="./secrets/datahub/DATAHUB_POSTGRES_PASSWORD"

# DataHub Neo4j Configuration
DATAHUB_NEO4J_PASSWORD="$DATAHUB_NEO4J_PASSWORD"

# DataHub System Configuration
DATAHUB_SYSTEM_CLIENT_ID="datahub-system"
DATAHUB_SYSTEM_CLIENT_SECRET="datahub-system-secret"
EOF
fi

if ! grep -q "Superset Configuration" .env; then
  cat << EOF >> .env

############################################################################################################################################################
# Section 22:
# Superset Configuration
############################################################################################################################################################

# Superset Database Configuration
SUPERSET_POSTGRES_HOST="localhost"
SUPERSET_POSTGRES_PORT="5432"
SUPERSET_POSTGRES_DB="superset"
SUPERSET_POSTGRES_USER="superset"
SUPERSET_POSTGRES_PASSWORD_FILE="./secrets/superset/SUPERSET_POSTGRES_PASSWORD"

# Superset Application Configuration
SUPERSET_SECRET_KEY_FILE="./secrets/superset/SUPERSET_SECRET_KEY"
SUPERSET_ADMIN_USERNAME="admin"
SUPERSET_ADMIN_EMAIL="admin@example.com"
SUPERSET_ADMIN_FIRSTNAME="Admin"
SUPERSET_ADMIN_LASTNAME="User"

# Superset OAuth Configuration
SUPERSET_OAUTH_ENABLED="true"
SUPERSET_OAUTH_CLIENT_ID="superset"
SUPERSET_OAUTH_CLIENT_SECRET="superset_secret"

# Content Page Configuration for New Services
CONTENT_AUTHENTIK_DISPLAY="show"
CONTENT_PORTAINER_DISPLAY="show"
CONTENT_DATAHUB_DISPLAY="show"
CONTENT_SUPERSET_DISPLAY="show"
EOF
fi

echo "Setup complete! Secret files have been created and .env file has been updated."
echo ""
echo "Next steps:"
echo "1. Create the necessary databases in PostgreSQL:"
echo ""
echo "   CREATE USER authentik WITH PASSWORD '$AUTHENTIK_PG_PASSWORD';"
echo "   CREATE DATABASE authentik OWNER authentik;"
echo ""
echo "   CREATE USER datahub WITH PASSWORD '$DATAHUB_PG_PASSWORD';"
echo "   CREATE DATABASE datahub OWNER datahub;"
echo ""
echo "   CREATE USER superset WITH PASSWORD '$SUPERSET_PG_PASSWORD';"
echo "   CREATE DATABASE superset OWNER superset;"
echo ""
echo "2. Start the services:"
echo "   docker compose --profile authentik --profile portainer --profile datahub --profile superset up -d"
echo ""
echo "3. Access the services at:"
echo "   - Authentik: https://${BROADSEA_HOST}/authentik"
echo "   - Portainer: https://${BROADSEA_HOST}/portainer"
echo "   - DataHub: https://${BROADSEA_HOST}/datahub"
echo "   - Superset: https://${BROADSEA_HOST}/superset"
echo ""
echo "For more information, see README-new-services.md"
