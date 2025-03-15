#!/bin/bash

# Test script for Authentik integration
# This script checks the status of Authentik and its dependencies

echo "===== Authentik Integration Test ====="
echo "Testing Authentik and its dependencies..."
echo

# Check if Docker is running
echo "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
else
  echo "✅ Docker is running."
fi

# Check if Redis container is running
echo "Checking Redis container..."
if docker ps | grep -q broadsea-authentik-redis; then
  echo "✅ Redis container is running."
  
  # Check Redis health
  echo "Checking Redis health..."
  if docker exec broadsea-authentik-redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis is healthy and responding to pings."
  else
    echo "❌ Redis is not responding to pings."
  fi
else
  echo "❌ Redis container is not running."
fi

# Check if Authentik container is running
echo "Checking Authentik container..."
if docker ps | grep -q broadsea-authentik; then
  echo "✅ Authentik container is running."
  
  # Check for fix_syntax.py output in logs
  echo "Checking for fix_syntax.py output in logs..."
  if docker logs broadsea-authentik 2>&1 | grep -q "\[INFO\] Configuration fix script completed successfully"; then
    echo "✅ fix_syntax.py script ran successfully."
  else
    echo "⚠️ Could not confirm if fix_syntax.py completed successfully."
    echo "   Check the logs manually with: docker logs broadsea-authentik | grep '\[INFO\]'"
  fi
  
  # Check for any errors in logs
  echo "Checking for errors in logs..."
  if docker logs broadsea-authentik 2>&1 | grep -q "\[ERROR\]"; then
    echo "⚠️ Found errors in Authentik logs:"
    docker logs broadsea-authentik 2>&1 | grep "\[ERROR\]" | head -5
    echo "   Check the full logs with: docker logs broadsea-authentik"
  else
    echo "✅ No errors found in Authentik logs."
  fi
  
  # Check if Authentik is responding to HTTP requests
  echo "Checking if Authentik is responding to HTTP requests..."
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/; then
    echo "✅ Authentik is responding to HTTP requests."
  else
    echo "⚠️ Authentik is not responding to HTTP requests on port 9000."
    echo "   This might be normal if Authentik is configured to only respond to HTTPS or through Traefik."
  fi
else
  echo "❌ Authentik container is not running."
  
  # Check if container exists but is not running
  if docker ps -a | grep -q broadsea-authentik; then
    echo "   Container exists but is not running. Check the logs with: docker logs broadsea-authentik"
  fi
fi

echo
echo "===== Test Complete ====="
echo "For more detailed troubleshooting, refer to authentik/README.md"
