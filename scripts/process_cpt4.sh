#!/bin/bash

# This script processes CPT4 vocabulary files using the UMLS API key

set -e

# Check if UMLS API key is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <umls_api_key>"
    exit 1
fi

UMLS_API_KEY="$1"
VOCAB_DIR="./vocabulary"

# Check if vocabulary directory exists
if [ ! -d "$VOCAB_DIR" ]; then
    echo "Error: Vocabulary directory $VOCAB_DIR does not exist"
    exit 1
fi

# Check if CPT4 files exist
if [ ! -f "$VOCAB_DIR/cpt.sh" ] || [ ! -f "$VOCAB_DIR/cpt4.jar" ]; then
    echo "Error: CPT4 files (cpt.sh and cpt4.jar) not found in $VOCAB_DIR"
    exit 1
fi

# Make the CPT4 scripts executable
chmod +x "$VOCAB_DIR/cpt.sh"
chmod +x "$VOCAB_DIR/cpt4.jar"

# Change to the vocabulary directory
cd "$VOCAB_DIR"

# Run the CPT4 processing
echo "Starting CPT4 processing with UMLS API key..."
./cpt.sh "$UMLS_API_KEY"

echo "CPT4 processing completed successfully"
