#!/bin/bash

# filepath: /Users/Justin.Neubert/projects/v1flows/runner-plugins/generate_dependabot.sh

ROOT_DIR="."
OUTPUT_FILE=".github/dependabot.yml"

# Start the dependabot.yml file
cat <<EOL > $OUTPUT_FILE
version: 2
updates:
EOL

# Find all directories containing go.mod files
find "$ROOT_DIR" -name "go.mod" | while read -r go_mod; do
  dir=$(dirname "$go_mod")
  cat <<EOL >> $OUTPUT_FILE
  - package-ecosystem: "gomod"
    directory: "$dir"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
    open-pull-requests-limit: 5
    target-branch: "develop"
EOL
done

echo "Generated $OUTPUT_FILE"