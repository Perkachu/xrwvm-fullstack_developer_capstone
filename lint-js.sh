#!/bin/bash

# This script runs JSHint on JavaScript files, excluding node_modules and other generated files

# Find only your custom JavaScript files
find ./server/database -name "*.js" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/vendor/*" \
  -not -path "*/static/*" \
  -not -path "*/djangoenv/*" \
  -exec npx jshint {} \;

# Check if JSHint found any errors
if [ $? -eq 0 ]; then
  echo "✅ Linted all JavaScript files successfully"
  exit 0
else
  echo "❌ JSHint found errors in your JavaScript files"
  exit 1
fi
