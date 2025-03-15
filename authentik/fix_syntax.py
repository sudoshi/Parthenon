#!/usr/bin/env python3

import os
import re
import sys
import time
import socket

def log_message(level, message):
    """Log a message with timestamp and level"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")

def check_redis_connection(host, port=6379, timeout=1):
    """Check if Redis is available"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((host, port))
        s.close()
        return True
    except Exception as e:
        return False

# Path to the settings.py file
settings_file = "/authentik/root/settings.py"

log_message("INFO", "Starting Authentik configuration fix script")

# Get Redis host from environment variable
redis_host = os.environ.get("AUTHENTIK_REDIS__HOST", "broadsea-authentik-redis")
log_message("INFO", f"Redis host set to: {redis_host}")

# Check if Redis is available
redis_available = check_redis_connection(redis_host)
if redis_available:
    log_message("INFO", "Redis connection successful")
else:
    log_message("WARNING", f"Redis connection failed. Will continue anyway, but Authentik may not start properly.")

try:
    # Check if settings file exists
    if not os.path.exists(settings_file):
        log_message("WARNING", f"Settings file {settings_file} does not exist. This is normal for first-time startup.")
        log_message("INFO", "Continuing with startup...")
        sys.exit(0)
    
    # Read the file
    try:
        with open(settings_file, "r") as f:
            content = f.read()
        log_message("INFO", "Successfully read settings file")
    except Exception as e:
        log_message("ERROR", f"Failed to read settings file: {e}")
        log_message("INFO", "Continuing with startup anyway...")
        sys.exit(0)

    # Check for the syntax error (missing comma)
    if '_ERROR_REPORTING = CONFIG.get_bool("error_reporting.enabled" False)' in content:
        log_message("INFO", "Found syntax error in error_reporting.enabled setting")
        fixed_content = content.replace(
            '_ERROR_REPORTING = CONFIG.get_bool("error_reporting.enabled" False)',
            '_ERROR_REPORTING = CONFIG.get_bool("error_reporting.enabled", False)'
        )
        log_message("INFO", "Syntax error fixed in memory")
    else:
        log_message("INFO", "No syntax error found in error_reporting.enabled setting")
        fixed_content = content

    # Fix the Attr object iteration issue
    attr_pattern = r'(for\s+\w+\s+in\s+CONFIG\.get\(["\']error_reporting["\'])'
    if re.search(attr_pattern, fixed_content):
        log_message("INFO", "Found potential Attr object iteration issue")
        # If found, modify to ensure it's properly handled as a dictionary
        fixed_content = re.sub(
            attr_pattern,
            r'for \1.get("extra_args", {})',
            fixed_content
        )
        log_message("INFO", "Attr object iteration issue fixed in memory")
    else:
        log_message("INFO", "No Attr object iteration issues found")

    # Check if content was modified
    if content != fixed_content:
        log_message("INFO", "Changes were made to the settings file, attempting to write")
        # Try to write the fixed content back to the file
        try:
            with open(settings_file, "w") as f:
                f.write(fixed_content)
            log_message("INFO", "Successfully wrote fixed settings to file")
        except PermissionError:
            log_message("WARNING", f"Permission denied when writing to {settings_file}")
            log_message("INFO", "Continuing with startup anyway...")
            # Exit with success code since we don't want to block the container startup
            sys.exit(0)
        except Exception as e:
            log_message("ERROR", f"Failed to write settings file: {e}")
            log_message("INFO", "Continuing with startup anyway...")
            sys.exit(0)
    else:
        log_message("INFO", "No changes needed to settings file")

    log_message("INFO", "Configuration fix script completed successfully")
except Exception as e:
    log_message("ERROR", f"Unexpected error in fix_syntax.py: {e}")
    log_message("INFO", "Continuing with startup anyway...")
    # Exit with success code since we don't want to block the container startup
    sys.exit(0)
