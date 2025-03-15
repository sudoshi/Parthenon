#!/bin/bash

# Wait for Docker to be fully started
sleep 30

# Change to the Broadsea directory
cd /home/acumenus/Docker/Broadsea

# Start the traefik and broadsea-content containers
docker-compose up -d traefik
docker-compose up -d broadsea-content

# Log the startup
echo "Broadsea services started at $(date)" >> /home/acumenus/broadsea-startup.log
