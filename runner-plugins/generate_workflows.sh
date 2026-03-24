#!/bin/bash

# Plugin workflows are now handled centrally in the monorepo root .github/workflows.
# This script is kept only as a compatibility marker.

set -euo pipefail

echo "Plugin workflows are managed by the root monorepo workflows:"
echo "  - .github/workflows/plugin-check.yml"
echo "  - .github/workflows/plugin-release.yml"