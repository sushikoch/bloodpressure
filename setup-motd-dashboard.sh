#!/bin/bash

################################################################################
# MOTD Dashboard - Setup Script
#
# This script reads motd-dashboard-files.json and creates the complete
# directory structure with all files in the current directory.
#
# Usage:
#   ./setup-motd-dashboard.sh [target-directory]
#
# Example:
#   ./setup-motd-dashboard.sh ~/motd-dashboard
#   ./setup-motd-dashboard.sh                    # Uses current directory
#
################################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
JSON_FILE="motd-dashboard-files.json"
TARGET_DIR="${1:-.}"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

check_requirements() {
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        echo "Install it with: brew install jq (macOS) or apt install jq (Linux)"
        exit 1
    fi

    # Check if JSON file exists
    if [ ! -f "$JSON_FILE" ]; then
        log_error "JSON file not found: $JSON_FILE"
        echo "Make sure this script is in the same directory as $JSON_FILE"
        exit 1
    fi
}

validate_json() {
    log_info "Validating JSON structure..."
    if ! jq empty "$JSON_FILE" 2>/dev/null; then
        log_error "Invalid JSON format in $JSON_FILE"
        exit 1
    fi
    log_success "JSON is valid"
}

create_directories() {
    log_info "Creating directory structure..."

    # Get all directory paths from JSON and sort them
    local dirs=$(jq -r '.files | keys[] | gsub("/[^/]*$"; "") | select(length > 0)' "$JSON_FILE" | sort -u)

    # Create base target directory
    mkdir -p "$TARGET_DIR"

    # Create subdirectories
    while IFS= read -r dir; do
        if [ -n "$dir" ]; then
            mkdir -p "$TARGET_DIR/$dir"
            log_success "Created directory: $dir"
        fi
    done <<< "$dirs"
}

create_files() {
    log_info "Creating files..."

    local file_count=0
    local exec_count=0

    # Iterate through each file in JSON
    jq -r '.files | keys[]' "$JSON_FILE" | while IFS= read -r filepath; do
        log_info "Creating file: $filepath"

        # Get file content from JSON
        local content=$(jq -r ".files[\"$filepath\"].content" "$JSON_FILE")

        # Create file with content
        echo -n "$content" > "$TARGET_DIR/$filepath"

        # Check if file should be executable
        local is_exec=$(jq -r ".files[\"$filepath\"].executable // false" "$JSON_FILE")
        if [ "$is_exec" = "true" ]; then
            chmod +x "$TARGET_DIR/$filepath"
            log_success "Created (executable): $filepath"
        else
            log_success "Created: $filepath"
        fi
    done
}

initialize_git() {
    log_info "Initializing Git repository..."

    cd "$TARGET_DIR"

    if [ -d ".git" ]; then
        log_info "Git repository already exists, skipping initialization"
        return
    fi

    git init
    git config user.email "motd-setup@example.com" 2>/dev/null || true
    git config user.name "MOTD Dashboard" 2>/dev/null || true

    log_success "Git repository initialized"

    cd - > /dev/null
}

create_gitignore_entry() {
    log_info "Adding .gitignore..."

    cd "$TARGET_DIR"

    # .gitignore is already created from JSON
    git add .gitignore 2>/dev/null || true

    log_success "Added .gitignore"

    cd - > /dev/null
}

show_next_steps() {
    cat <<EOF

${GREEN}✓ Successfully created MOTD Dashboard structure!${NC}

📁 Created directory: $TARGET_DIR

Next steps:
  1. Create a new repository on GitHub:
     https://github.com/new?name=motd-dashboard

  2. Add remote and push:
     cd $TARGET_DIR
     git add -A
     git commit -m "Initial commit: MOTD Dashboard"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/motd-dashboard.git
     git push -u origin main

📚 Documentation:
  - Main README: $TARGET_DIR/README.md
  - Ansible role: $TARGET_DIR/ansible/roles/motd_dashboard/README.md
  - Example playbook: $TARGET_DIR/ansible/example-motd-playbook.yml

✨ You're all set! Push to GitHub and you're done.

EOF
}

# Main execution
main() {
    echo ""
    log_info "MOTD Dashboard Setup"
    echo ""

    check_requirements
    validate_json
    create_directories
    create_files
    initialize_git
    create_gitignore_entry

    echo ""
    show_next_steps
}

# Run main function
main "$@"
