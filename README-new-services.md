# New Services for Broadsea

This document provides instructions for setting up and using the new services added to the Broadsea stack:

1. **Authentik** - OAuth/SAML provider for user authentication
2. **Portainer** - Container/stack management
3. **DataHub** - Data profiling for raw population datasets
4. **Superset** - Enhanced data visualization for OMOP CDM

## Prerequisites

Before using these services, ensure you have:

1. A running PostgreSQL instance at localhost (or another accessible host)
2. Docker and Docker Compose installed
3. Sufficient disk space and memory for running these services

## Setup Instructions

### 1. Create Database Users and Databases

Connect to your PostgreSQL instance and create the necessary databases and users:

```sql
-- For Authentik
CREATE USER authentik WITH PASSWORD 'your_secure_password';
CREATE DATABASE authentik OWNER authentik;

-- For DataHub
CREATE USER datahub WITH PASSWORD 'your_secure_password';
CREATE DATABASE datahub OWNER datahub;

-- For Superset
CREATE USER superset WITH PASSWORD 'your_secure_password';
CREATE DATABASE superset OWNER superset;
```

### 2. Set Up Secret Files

Create the necessary secret files in the `secrets` directory:

```bash
# Authentik secrets
echo "your_secure_password" > secrets/authentik/AUTHENTIK_POSTGRES_PASSWORD
openssl rand -base64 32 > secrets/authentik/AUTHENTIK_SECRET_KEY

# Portainer secrets
echo "your_secure_password" > secrets/portainer/PORTAINER_ADMIN_PASSWORD

# DataHub secrets
echo "your_secure_password" > secrets/datahub/DATAHUB_POSTGRES_PASSWORD

# Superset secrets
echo "your_secure_password" > secrets/superset/SUPERSET_POSTGRES_PASSWORD
openssl rand -base64 32 > secrets/superset/SUPERSET_SECRET_KEY
```

### 3. Start the Services

You can start each service individually using the appropriate profile:

```bash
# Start Authentik
docker compose --profile authentik up -d

# Start Portainer
docker compose --profile portainer up -d

# Start DataHub
docker compose --profile datahub up -d

# Start Superset
docker compose --profile superset up -d
```

Or start all new services together:

```bash
docker compose --profile authentik --profile portainer --profile datahub --profile superset up -d
```

## Accessing the Services

After starting the services, you can access them at the following URLs:

- **Authentik**: https://[BROADSEA_HOST]/authentik
- **Portainer**: https://[BROADSEA_HOST]/portainer
- **DataHub**: https://[BROADSEA_HOST]/datahub
- **Superset**: https://[BROADSEA_HOST]/superset

## Initial Configuration

### Authentik

1. Navigate to https://[BROADSEA_HOST]/authentik
2. Log in with the default admin credentials (username: `akadmin`, password: `admin`)
3. Change the default password immediately
4. Set up SAML providers for your applications

### Portainer

1. Navigate to https://[BROADSEA_HOST]/portainer
2. Create an admin user with the password you specified in the secret file
3. Connect to your local Docker environment

### DataHub

1. Navigate to https://[BROADSEA_HOST]/datahub
2. Log in with the default credentials (username: `datahub`, password: `datahub`)
3. Set up data sources for your OMOP CDM and raw population datasets

### Superset

1. Navigate to https://[BROADSEA_HOST]/superset
2. Log in with the admin credentials you configured
3. Set up database connections to your OMOP CDM
4. Create dashboards for visualizing your data

## Integration with Atlas

### Configuring Atlas to use Authentik for Authentication

1. In Authentik, create a SAML provider for Atlas
2. Update the Atlas configuration to use SAML authentication
3. Configure the WebAPI security settings to use SAML

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify that the PostgreSQL host is accessible from the Docker containers
   - Check that the database users have the correct permissions

2. **Service Not Starting**:
   - Check the Docker logs: `docker logs [container_name]`
   - Verify that all required environment variables are set

3. **Authentication Issues**:
   - Ensure that the secret files contain the correct credentials
   - Check the Authentik logs for SAML configuration issues

## Maintenance

### Backing Up Data

It's recommended to regularly back up the following:

1. PostgreSQL databases
2. Docker volumes (especially for Authentik, Portainer, and Superset)

### Updating Services

To update a service to a newer version:

1. Pull the latest images: `docker compose pull [service_name]`
2. Restart the service: `docker compose --profile [profile_name] up -d`

## Additional Resources

- [Authentik Documentation](https://goauthentik.io/docs/)
- [Portainer Documentation](https://docs.portainer.io/)
- [DataHub Documentation](https://datahubproject.io/docs/)
- [Superset Documentation](https://superset.apache.org/docs/intro)
