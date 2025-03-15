# Authentik Integration for Broadsea

This directory contains the configuration for Authentik, a modern Identity Provider focused on flexibility and security.

## Configuration Fix

The Authentik container has been customized to address a known issue with the configuration file that was causing startup failures. The issue was a syntax error in the error_reporting.enabled setting, where a comma was missing.

### What's Included

1. **Custom Dockerfile**
   - Uses the official Authentik image as a base
   - Adds a fix_syntax.py script to correct configuration issues
   - Modifies the entrypoint to run the fix script before starting Authentik

2. **fix_syntax.py Script**
   - Automatically fixes the syntax error in the configuration
   - Handles permission issues gracefully
   - Provides detailed logging
   - Checks Redis connectivity
   - Continues startup even if fixes can't be applied

3. **Docker Compose Configuration**
   - Ensures Redis is started and healthy before Authentik
   - Uses the custom Dockerfile instead of the official image
   - Properly configures dependencies between services

## Testing

To test the Authentik integration:

1. Start the entire stack:
   ```bash
   docker-compose up -d
   ```

2. Check the logs to ensure Authentik starts properly:
   ```bash
   docker logs broadsea-authentik
   ```

3. Access the Authentik UI at:
   ```
   https://your-broadsea-host/authentik/
   ```

## Troubleshooting

If you encounter issues:

1. **Check Redis Connectivity**
   - Ensure the Redis container is running:
     ```bash
     docker ps | grep broadsea-authentik-redis
     ```
   - Check Redis logs:
     ```bash
     docker logs broadsea-authentik-redis
     ```

2. **Check Authentik Logs**
   - Look for the fix_syntax.py output:
     ```bash
     docker logs broadsea-authentik | grep "\[INFO\]"
     ```
   - Check for errors:
     ```bash
     docker logs broadsea-authentik | grep "\[ERROR\]"
     ```

3. **Database Issues**
   - Ensure the PostgreSQL database for Authentik exists
   - Verify the database credentials in the .env file

4. **Manual Fix**
   - If needed, you can manually fix the syntax error by editing the settings.py file inside the container:
     ```bash
     docker exec -it broadsea-authentik bash
     apt-get update && apt-get install -y nano
     nano /authentik/root/settings.py
     ```
   - Look for the line with `_ERROR_REPORTING = CONFIG.get_bool("error_reporting.enabled" False)` and add a comma before `False`
