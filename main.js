#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory where commands are stored
const commandsDir = path.join(__dirname, 'commands');

// Mapping of command names to descriptions
const commandDescriptions = {
    'start [(NUM)GB/MB]': 'Starts the PaperMC server with optional memory allocation (e.g., "node main.js start 4GB").',
    'stop': 'Stops the currently running PaperMC server process.',
    'set-version [VERSION]': 'Sets the current PaperMC version to a specified installed version. (e.g., "thiccpaper set-version paper-1.20-17")',
    'install-version [VERSION]': 'Installs PaperMC version from the official repository. (e.g., "thiccpaper install-version 1.20")',
    'help': 'This stuff right here :)'
};

// Function to load and execute a command
async function loadCommand(commandName, args) {
    const commandFile = path.join(commandsDir, `${commandName}.js`);

    try {
        // Check if the command file exists
        if (!fs.existsSync(commandFile)) {
            throw new Error(`Command '${commandName}' not found.`);
        }

        // Import the command module dynamically
        const commandModule = require(commandFile);

        // Check if the module has an execute function
        if (typeof commandModule.execute === 'function') {
            await commandModule.execute(args);
        } else {
            throw new Error(`Command '${commandName}' does not export an execute function.`);
        }
    } catch (error) {
        console.error(`Error executing command '${commandName}':`, error.message);
    }
}

// Function to display available commands and their descriptions
function displayHelp() {
    console.log('Available commands:');
    Object.entries(commandDescriptions).forEach(([command, description]) => {
        console.log(`- ${command}: ${description}`);
    });
}

// Parse command-line arguments
const args = process.argv.slice(2);
const commandName = args[0];
const commandArgs = args.slice(1);

// Check if no command name is provided or "help" is explicitly requested
if (!commandName || commandName === 'help') {
    displayHelp();
    process.exit(0);
}

// Load and execute the specified command
loadCommand(commandName, commandArgs);
