#!/bin/bash

# This script runs the entire vocabulary loading process

set -e

# Check if UMLS API key file exists
UMLS_API_KEY_FILE="./secrets/omop_vocab/UMLS_API_KEY"
UMLS_API_KEY=""

if [ -f "$UMLS_API_KEY_FILE" ]; then
    UMLS_API_KEY=$(cat "$UMLS_API_KEY_FILE")
    echo "Found UMLS API key in $UMLS_API_KEY_FILE"
else
    echo "UMLS API key file not found at $UMLS_API_KEY_FILE"
    echo "CPT4 processing will be skipped"
fi

# Process CPT4 if UMLS API key is available
if [ -n "$UMLS_API_KEY" ]; then
    echo "Processing CPT4 codes with UMLS API key..."
    ./scripts/process_cpt4.sh "$UMLS_API_KEY"
else
    echo "Skipping CPT4 processing (no UMLS API key provided)"
fi

# Create vocabulary_processed directory if it doesn't exist
mkdir -p vocabulary_processed

# Clean vocabulary files
echo "Cleaning vocabulary files..."
python3 ./scripts/clean_vocab.py ./vocabulary ./vocabulary_processed

# Run the vocabulary loading process
echo "Starting vocabulary loading process..."
docker compose --profile omop-vocab-pg-load up -d

echo "Vocabulary loading process started in the background"
echo "You can check the progress with: docker logs -f omop-vocab-load"
