#!/bin/bash

set -e

# Install required packages
apk update
apk add postgresql-client pv

cd /tmp/files

# Process CPT4 if UMLS API key is available
UMLS_API_KEY=$(cat /run/secrets/UMLS_API_KEY)

if [ -z "$UMLS_API_KEY" ]
then
      echo "\$UMLS_API_KEY is empty"
else
    echo 'Running CPT4 process'
    apk add openjdk11
    chmod +x ./cpt.sh
    chmod +x ./cpt4.jar
    sh ./cpt.sh $UMLS_API_KEY
fi

# Create schema and tables
PGPASSWORD=$(cat /run/secrets/VOCAB_PG_PASSWORD) psql -v vocab_schema=$VOCAB_PG_SCHEMA -h $VOCAB_PG_HOST -U $VOCAB_PG_USER -d $VOCAB_PG_DATABASE -a -f /tmp/scripts/omop_vocab_ddl.sql

# Drop circular foreign keys before loading
echo "Dropping domain->concept circular foreign keys..."
PGPASSWORD=$(cat /run/secrets/VOCAB_PG_PASSWORD) psql -h $VOCAB_PG_HOST -U $VOCAB_PG_USER -d $VOCAB_PG_DATABASE <<EOF
ALTER TABLE $VOCAB_PG_SCHEMA.domain DROP CONSTRAINT IF EXISTS fpk_domain_domain_concept_id;
ALTER TABLE $VOCAB_PG_SCHEMA.concept DROP CONSTRAINT IF EXISTS fpk_concept_domain_id;
EOF

# Define function for loading tab-delimited files with progress bar
load_tab_vocab_file() {
  local table_name="$1"
  local file_name="$2"
  local file_path="/tmp/files/$file_name"

  if [[ ! -f "$file_path" ]]; then
    echo "WARNING: $file_name not found in /tmp/files. Skipping $table_name."
    return
  fi

  echo ""
  echo "Loading $file_name into $table_name (tab-delimited) with progress bar..."

  # Use a more robust approach for problematic CSV files
  # First, create a temporary file with the SQL COPY command
  local temp_sql=$(mktemp)
  echo "\\COPY $table_name FROM '$file_path' WITH (FORMAT csv, DELIMITER E'\t', HEADER, NULL '');" > "$temp_sql"
  
  # Execute the SQL file
  PGPASSWORD=$(cat /run/secrets/VOCAB_PG_PASSWORD) psql -h $VOCAB_PG_HOST -d $VOCAB_PG_DATABASE -U $VOCAB_PG_USER -f "$temp_sql"
  
  # Clean up
  rm "$temp_sql"
}

# Load tables in the correct order
tables="DOMAIN VOCABULARY CONCEPT_CLASS RELATIONSHIP CONCEPT CONCEPT_RELATIONSHIP CONCEPT_SYNONYM CONCEPT_ANCESTOR DRUG_STRENGTH SOURCE_TO_CONCEPT_MAP"

for table in $tables
do
    load_tab_vocab_file "$VOCAB_PG_SCHEMA.$table" "$table.csv"
done

# Re-add circular foreign keys
echo ""
echo "Recreating domain->concept foreign keys..."

PGPASSWORD=$(cat /run/secrets/VOCAB_PG_PASSWORD) psql -h $VOCAB_PG_HOST -U $VOCAB_PG_USER -d $VOCAB_PG_DATABASE <<EOF
-- domain.domain_concept_id -> concept.concept_id
ALTER TABLE $VOCAB_PG_SCHEMA.domain
  ADD CONSTRAINT fpk_domain_domain_concept_id
  FOREIGN KEY (domain_concept_id)
  REFERENCES $VOCAB_PG_SCHEMA.concept(concept_id);

-- concept.domain_id -> domain.domain_id
ALTER TABLE $VOCAB_PG_SCHEMA.concept
  ADD CONSTRAINT fpk_concept_domain_id
  FOREIGN KEY (domain_id)
  REFERENCES $VOCAB_PG_SCHEMA.domain(domain_id);
EOF

# Create indices
PGPASSWORD=$(cat /run/secrets/VOCAB_PG_PASSWORD) psql -v vocab_schema=$VOCAB_PG_SCHEMA -h $VOCAB_PG_HOST -U $VOCAB_PG_USER -d $VOCAB_PG_DATABASE -a -f /tmp/scripts/omop_vocab_indices.sql

# Trigger Solr import if needed
if [ "$TRIGGER_SOLR_IMPORT" = "true" ]; then
    echo "Triggering Solr vocabulary import..."
    curl -d "vocab_database_schema=$VOCAB_PG_SCHEMA" -X POST $SOLR_VOCAB_ENDPOINT/$SOLR_VOCAB_VERSION/dataimport?command=full-import&entity=concept
fi

echo 'All done, shutting down. Feel free to remove container.'
