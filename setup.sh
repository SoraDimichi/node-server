#!/bin/bash
set -e

# Copy SQL files to the directory where PostgreSQL expects initialization scripts

# Set the password for the marcus user
export PGPASSWORD=marcus

# Run SQL scripts
echo "Running SQL structure..."
psql -d example -f /db/structure.sql -U marcus
echo "Running SQL data..."
psql -d example -f /db/data.sql -U marcus

# Unset the password to avoid any security risks
unset PGPASSWORD
