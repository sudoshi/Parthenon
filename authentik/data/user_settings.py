# Custom settings to fix the error in authentik
# This file overrides the problematic settings in the authentik code

# Override the error reporting settings to avoid the syntax error
# Using a simple boolean instead of a complex structure
ERROR_REPORTING_ENABLED = False

# Set the URL prefix for Authentik
# This is needed when Authentik is served at a subpath
URL_PREFIX = ""

# Make sure we have the correct PostgreSQL settings
POSTGRESQL = {
    "host": "172.17.0.1",
    "port": 5432,
    "name": "authentik",
    "user": "authentik",
    "password": "4hkfPHHZ0is7wCc8sDDTrA==",
    "sslmode": "prefer",
}

# Set the secret key
SECRET_KEY = "ecF0YYEWggohadt6lBOiHQufQkpZwF37WdvF2IOkzxo="

# Disable update check
DISABLE_UPDATE_CHECK = True
