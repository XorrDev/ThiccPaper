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
        console.error(`Failed to send RCON command '${command}':`, err);
        throw err; // Re-throw the error to handle in caller function
    }
}

// Function to stop the PaperMC server
const stopPaperMC = async () => {
    try {
        // Delete the server.lock file
        const lockFilePath = path.join(__dirname, 'server.lock');
        if (fs.existsSync(lockFilePath)) {
            fs.unlinkSync(lockFilePath);
            console.log('Deleted server.lock file.');
        } else {
            console.log('server.lock file not found.');
        }

        // Send the stop command via RCON
        await sendRconCommand('stop');
        console.log('Shutdown command sent successfully.');
    } catch (err) {
        console.error('Failed to send shutdown command:', err);
    }
};

// Export execute function
module.exports.execute = stopPaperMC;
