# How to Deploy OHDSI Broadsea with Apache Virtual Host

This guide will walk you through the process of deploying the OHDSI Broadsea application stack behind an Apache virtual host with HTTPS support. We'll use `omop.example.com` as our domain name.

## What is OHDSI Broadsea?

Broadsea is a Docker-based deployment solution for OHDSI (Observational Health Data Sciences and Informatics) tools. It provides a containerized environment for running various OHDSI applications, including:

- **ATLAS**: A web-based tool for designing cohort definitions, characterizations, population-level effect estimation, and patient-level prediction
- **WebAPI**: A REST API that provides the backend services for ATLAS
- **HADES**: A suite of R packages for data analytics
- **Achilles**: A tool for data characterization and quality assessment
- **Data Quality Dashboard**: A tool for assessing the quality of your OMOP CDM data
- **Ares**: A visualization tool for exploring data quality results
- **Perseus**: A suite of tools for ETL design and execution

Broadsea makes it easy to deploy these tools together in a consistent environment, with proper configuration and integration between components.

## Prerequisites

- Ubuntu server with Apache installed
- Let's Encrypt certificates for your domain
- Docker and Docker Compose installed
- Broadsea application stack downloaded
- Basic understanding of Apache, Docker, and networking concepts

## Step 1: Configure the Broadsea Environment

1. Edit the `.env` file in your Broadsea directory to set the host and HTTP type:
   ```
   BROADSEA_HOST="omop.example.com"
   HTTP_TYPE="https"
   ```

2. Review other settings in the `.env` file that you might want to customize:
   - Database credentials
   - Security settings
   - Feature toggles for different OHDSI tools
   - Data source configurations

## Step 2: Configure Traefik for HTTPS

1. Ensure the Traefik configuration in `traefik/tls_https.yml` points to your Let's Encrypt certificates:
   ```yaml
   tls:
     stores:
       default:
         defaultCertificate:
           certFile: /etc/letsencrypt/live/omop.example.com/fullchain.pem
           keyFile: /etc/letsencrypt/live/omop.example.com/privkey.pem
   ```

2. Make sure the `docker-compose.yml` file mounts the Let's Encrypt certificates directory:
   ```yaml
   volumes:
     - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

3. Understand the Traefik configuration:
   - Traefik is a modern HTTP reverse proxy and load balancer
   - In Broadsea, Traefik routes requests to the appropriate services based on the URL path
   - The configuration is split across multiple files in the `traefik/` directory
   - `traefik_https.yml` contains the main Traefik configuration
   - `tls_https.yml` contains the TLS/SSL configuration
   - `routers.yml` contains the routing rules for different services

## Step 3: Create Apache Virtual Host Configuration

1. Create a file named `omop.example.com.conf` with the following content:
   ```apache
   <VirtualHost *:443>
       ServerName omop.example.com
       
       SSLEngine on
       SSLCertificateFile /etc/letsencrypt/live/omop.example.com/fullchain.pem
       SSLCertificateKeyFile /etc/letsencrypt/live/omop.example.com/privkey.pem

       ProxyPreserveHost On
       ProxyRequests Off
       ProxyVia On
       SSLProxyEngine On
       SSLProxyVerify none
       SSLProxyCheckPeerCN off
       SSLProxyCheckPeerName off
       SSLProxyCheckPeerExpire off

       # Additional proxy settings
       RequestHeader set X-Forwarded-Proto "https"
       RequestHeader set X-Forwarded-Port "443"
       RequestHeader set X-Forwarded-Host "omop.example.com"
       RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"

       # Proxy HTTPS traffic to Traefik HTTPS
       ProxyPass / https://localhost:9443/
       ProxyPassReverse / https://localhost:9443/

       # Enable required Apache modules
       <IfModule !mod_headers.c>
           LoadModule headers_module /usr/lib/apache2/modules/mod_headers.so
       </IfModule>

       # Logging
       ErrorLog ${APACHE_LOG_DIR}/omop.example.com-error.log
       CustomLog ${APACHE_LOG_DIR}/omop.example.com-access.log combined
   </VirtualHost>

   # Redirect HTTP to HTTPS
   <VirtualHost *:80>
       ServerName omop.example.com
       Redirect permanent / https://omop.example.com/
   </VirtualHost>
   ```

2. Key points about this configuration:
   - It sets up both HTTP (port 80) and HTTPS (port 443) virtual hosts
   - HTTP requests are permanently redirected to HTTPS
   - HTTPS requests are proxied to Traefik's HTTPS port (9443)
   - SSL proxy settings are enabled to handle HTTPS connections properly
   - X-Forwarded headers are set to preserve the original request information
   - Logging is configured to separate files for this virtual host

## Step 4: Enable the Apache Configuration

1. Copy the configuration file to the Apache sites-available directory:
   ```bash
   sudo cp omop.example.com.conf /etc/apache2/sites-available/
   ```

2. Disable any existing configurations for the same domain to avoid conflicts:
   ```bash
   sudo a2dissite omop.example.com*.conf
   ```

3. Enable the new configuration:
   ```bash
   sudo a2ensite omop.example.com.conf
   ```

4. Ensure that the required Apache modules are enabled:
   ```bash
   sudo a2enmod ssl proxy proxy_http proxy_html headers
   ```

5. Reload Apache to apply the changes:
   ```bash
   sudo systemctl reload apache2
   ```

## Step 5: Start the Broadsea Stack

1. Start the Broadsea stack using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Monitor the startup process:
   ```bash
   docker-compose logs -f
   ```

3. Check that all services are running:
   ```bash
   docker-compose ps
   ```

## Step 6: Verify the Setup

1. Test the main page:
   ```bash
   curl -IL https://omop.example.com/
   ```
   You should get a 200 OK response.

2. Test the ATLAS application:
   ```bash
   curl -IL https://omop.example.com/atlas/
   ```
   You should get a 200 OK response.

3. Test the WebAPI service:
   ```bash
   curl -IL https://omop.example.com/WebAPI/source/sources
   ```
   You should get a 200 OK response.

4. Open the applications in your browser:
   - Main page: https://omop.example.com/
   - ATLAS: https://omop.example.com/atlas/
   - HADES (RStudio): https://omop.example.com/hades/
   - Ares (if enabled): https://omop.example.com/ares/
   - pgAdmin (if enabled): https://omop.example.com/pgadmin4/

## Troubleshooting

### Redirection Loops

If you encounter redirection loops (HTTP 308 responses that keep redirecting), check:
1. Make sure Apache is proxying to Traefik's HTTPS port (9443) and not the HTTP port (9080)
2. Verify that the X-Forwarded headers are correctly set in the Apache configuration
3. Check that Traefik is configured to use HTTPS

Common symptoms of a redirection loop:
- Browser shows "Too many redirects" error
- `curl -IL` shows multiple 308 Permanent Redirect responses
- Network traffic shows a cycle of redirects between servers

### SSL Certificate Issues

If you encounter SSL certificate issues:
1. Verify that the certificate paths in both Apache and Traefik configurations are correct
2. Make sure the certificates are readable by both Apache and Docker
3. Check that the SSL proxy settings are enabled in the Apache configuration

Common SSL certificate issues:
- Browser shows "Your connection is not private" or "Certificate error"
- `curl` shows SSL verification errors
- Certificate path doesn't exist or is not readable

### 404 Not Found Errors

If specific endpoints return 404 errors:
1. Check the Traefik router configuration in `traefik/routers.yml`
2. Verify that the services are running in the Docker Compose stack
3. Check the logs of the specific service for any errors

To check service logs:
```bash
docker-compose logs ohdsi-webapi
docker-compose logs ohdsi-atlas
```

### Database Connection Issues

If you encounter database connection issues:
1. Check that the database container is running
2. Verify the database credentials in the `.env` file
3. Check the logs of the service that's trying to connect to the database

To check database logs:
```bash
docker-compose logs broadsea-atlasdb
```

## Getting Started with OHDSI Tools

Once your Broadsea stack is up and running, here are some tips for getting started with the OHDSI tools:

### ATLAS

ATLAS is the main web application for designing and executing observational studies. Here's how to get started:

1. Access ATLAS at https://omop.example.com/atlas/
2. Configure data sources:
   - Go to "Configuration" > "Source Configuration"
   - Add your OMOP CDM data sources
3. Explore the different modules:
   - Data Sources: Browse the vocabulary and data in your CDM
   - Cohort Definitions: Define patient cohorts
   - Characterizations: Analyze cohort characteristics
   - Cohort Pathways: Visualize treatment pathways
   - Incidence Rates: Calculate incidence rates
   - Estimation: Perform population-level effect estimation
   - Prediction: Build patient-level prediction models

### HADES (RStudio)

HADES is a suite of R packages for data analytics. Here's how to get started:

1. Access RStudio at https://omop.example.com/hades/
2. Log in with the credentials specified in your `.env` file
3. Use the pre-installed HADES packages:
   - DatabaseConnector: Connect to your database
   - SqlRender: Write SQL that works across different database platforms
   - FeatureExtraction: Extract features from your data
   - CohortGenerator: Generate cohorts
   - CohortDiagnostics: Diagnose cohort definitions
   - PatientLevelPrediction: Build prediction models
   - CohortMethod: Perform causal effect estimation

### Data Quality Assessment

Broadsea includes tools for assessing the quality of your OMOP CDM data:

1. Achilles: Generates descriptive statistics and data quality metrics
   - Run Achilles on your CDM data using the provided scripts
   - View the results in ATLAS under "Data Sources" > "Database Dashboard"

2. Data Quality Dashboard: Provides a comprehensive data quality assessment
   - Run the Data Quality Dashboard on your CDM data
   - View the results in the dashboard UI

3. Ares: Visualizes data quality results
   - Access Ares at https://omop.example.com/ares/
   - Explore the data quality visualizations

## OMOP CDM Resources

The OMOP Common Data Model (CDM) is the foundation of the OHDSI ecosystem. Here are some resources to help you understand and work with the CDM:

1. [OMOP CDM Documentation](https://ohdsi.github.io/CommonDataModel/)
2. [OHDSI Vocabulary Resources](https://www.ohdsi.org/web/wiki/doku.php?id=documentation:vocabulary:sidebar)
3. [The Book of OHDSI](https://ohdsi.github.io/TheBookOfOhdsi/)
4. [OHDSI Forums](https://forums.ohdsi.org/)
5. [OHDSI GitHub Repositories](https://github.com/OHDSI)

## Maintenance and Updates

### Backing Up Your Data

It's important to regularly back up your data, especially the database that stores your ATLAS configurations and results:

```bash
# Backup the PostgreSQL database
docker exec -t broadsea-atlasdb pg_dumpall -c -U postgres > broadsea_backup_$(date +%Y-%m-%d).sql

# Backup the .env file and other configuration files
cp .env .env.backup
cp -r traefik/ traefik.backup/
```

### Updating Broadsea

To update your Broadsea installation:

1. Pull the latest changes from the repository:
   ```bash
   git pull
   ```

2. Update the Docker images:
   ```bash
   docker-compose pull
   ```

3. Restart the stack:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Monitoring

Monitor your Broadsea stack for issues:

1. Check container status:
   ```bash
   docker-compose ps
   ```

2. Check container logs:
   ```bash
   docker-compose logs -f
   ```

3. Monitor resource usage:
   ```bash
   docker stats
   ```

## Conclusion

You now have a fully functional OHDSI Broadsea stack running behind an Apache virtual host with HTTPS support. The stack includes ATLAS, WebAPI, and other OHDSI tools, all accessible through your domain name.

This setup provides a secure, integrated environment for working with observational health data using the OHDSI tools. By following the OMOP CDM and using these tools, you can contribute to the collaborative, open-science approach of the OHDSI community.

For more information and support, visit the [OHDSI website](https://www.ohdsi.org/) and join the [OHDSI Forums](https://forums.ohdsi.org/).
