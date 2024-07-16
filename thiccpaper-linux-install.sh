#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Node.js and npm are installed
if ! command_exists node || ! command_exists npm; then
  echo "Node.js or npm is not installed. Installing Node.js..."
  
  # Install Node.js and npm (replace with appropriate installation method for your system)
  # Example for Linux using apt package manager:
  sudo apt update
  sudo apt install -y nodejs npm
fi

# Navigate to the application directory
cd thiccpaper

# Install required npm packages
echo "Installing npm packages..."
npm install

# Create directory for Paper installations if not exists
mkdir -p paper-installations

# Create symbolic link for main.js
sudo ln -sf "$(pwd)/main.js" /usr/local/bin/thiccpaper
echo "Symbolic link created: /usr/local/bin/thiccpaper -> $(pwd)/main.js"

# Display completion message
echo "Installation complete. ThiccPaper is ready to use!"
