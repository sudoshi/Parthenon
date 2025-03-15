FROM ghcr.io/goauthentik/server:2023.8.3

# Copy the fix_syntax.py script
COPY fix_syntax.py /app/fix_syntax.py

# Run the script before starting the server
ENTRYPOINT ["/bin/sh", "-c", "python /app/fix_syntax.py && /usr/local/bin/dumb-init -- /lifecycle/ak"]
