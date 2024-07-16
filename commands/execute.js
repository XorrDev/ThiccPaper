const { Rcon } = require('rcon-client');
const fs = require('fs');
const path = require('path');

// Define RCON connection parameters
const rconConfig = {
    host: '::1',           // IPv6 localhost
    port: 25575,           // RCON port
    password: 'thiccpaper' // RCON password
};

// Function to send RCON commands
async function sendRconCommand(command) {
    try {
        const rcon = await Rcon.connect(rconConfig);
        const response = await rcon.send(command);
        console.log(`RCON Command '${command}' sent: ${response}`);
        await rcon.end(); // Close the RCON connection
    } catch (err) {
        console.error('Failed to send RCON command:', err);
        throw err; // Re-throw the error to handle in caller function
    }
}

// Execute function to handle command arguments
async function executeCommand(args) {
    try {
        if (args.length === 0) {
            console.error('No RCON command provided.');
            return;
        }

        // Join all arguments to form the RCON command
        const command = args.join(' ');

        // Send the RCON command
        await sendRconCommand(command);
    } catch (err) {
        console.error('Failed to execute RCON command:', err);
    }
}

// Export execute function
module.exports.execute = executeCommand;
