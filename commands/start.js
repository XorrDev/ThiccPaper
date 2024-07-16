const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to start the PaperMC server
const startPaperMC = async (args) => {
    // Load package.json to get current-paper-version
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson['current-paper-version'];

    // Ensure the version directory exists
    const versionDir = path.join(__dirname, `../paper-installations/${currentVersion}`);
    if (!fs.existsSync(versionDir)) {
        fs.mkdirSync(versionDir, { recursive: true });
    }

    // Construct path to the JAR file
    const jarPath = path.join(versionDir, `${currentVersion}.jar`);

    // Check if the JAR file exists
    if (!fs.existsSync(jarPath)) {
        console.error(`JAR file ${currentVersion}.jar not found in ${versionDir}`);
        return;
    }

    // Update server.properties to enable RCON and set rcon.password
    updateServerProperties(versionDir, 'enable-rcon', 'true');
    updateServerProperties(versionDir, 'rcon.password', 'thiccpaper');

    // Start the PaperMC server process
    await startServerProcess(jarPath, versionDir, args);
};

// Function to update server.properties
const updateServerProperties = (versionDir, propertyName, value) => {
    const serverPropertiesPath = path.join(versionDir, 'server.properties');

    if (fs.existsSync(serverPropertiesPath)) {
        let serverProperties = fs.readFileSync(serverPropertiesPath, 'utf8');
        serverProperties = serverProperties.replace(new RegExp(`^${propertyName}=.*`, 'm'), `${propertyName}=${value}`);

        // Write back the modified server.properties file
        fs.writeFileSync(serverPropertiesPath, serverProperties);
        console.log(`Updated ${propertyName} in server.properties to ${value}`);
    } else {
        console.error(`server.properties not found in ${versionDir}`);
    }
};

// Function to start the server process
const startServerProcess = async (jarPath, versionDir, args) => {
    // Check if the server is already running by checking for a lock file
    const lockFilePath = path.join(__dirname, 'server.lock');
    if (fs.existsSync(lockFilePath)) {
        console.log('Server is already running.');
        return;
    }

    // Create a lock file to indicate that the server is running
    fs.writeFileSync(lockFilePath, '');

    // Parse memory argument (default to 2GB if not specified)
    let memory = '2GB';
    if (args.length > 0) {
        memory = args[0].toUpperCase();
    }

    // Convert memory size to megabytes
    let memoryInMB;
    if (memory.endsWith('GB')) {
        memoryInMB = parseInt(memory.replace('GB', ''), 10) * 1024;
    } else if (memory.endsWith('MB')) {
        memoryInMB = parseInt(memory.replace('MB', ''), 10);
    } else {
        console.error('Invalid memory format. Please use format like "4GB" or "4096MB".');
        return;
    }

    // Start the PaperMC server process with memory specification and without GUI
    const serverProcess = spawn('java', [`-Xmx${memoryInMB}M`, '-jar', jarPath, '--nogui'], {
        cwd: versionDir,
        detached: true,  // Run the process detached (in the background)
        stdio: 'pipe'    // Use 'pipe' to capture stdout and stderr
    });

    console.log(`Started PaperMC server with ${memory} memory allocation`);

    // Handle stdout and stderr data
    serverProcess.stdout.on('data', (data) => {
        const message = data.toString().trim();
        console.log(message);
        if (message.includes('Done (')) {
            console.log('Server startup complete. Closing this script.');
            setTimeout(() => {
                process.exit(0); // Exit the script after a brief delay
            }, 2000); // Adjust delay as needed
        }
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`Error from server process: ${data}`);
    });

    // Event listener for process error
    serverProcess.on('error', (err) => {
        console.error('Failed to start PaperMC server:', err);
        process.exit(1);
    });

    // Event listener for process exit
    serverProcess.on('exit', (code) => {
        console.log('Server process exited with code', code);
        // Remove the lock file when the server process exits
        fs.unlinkSync(lockFilePath);
    });
};

// Export execute function
module.exports.execute = startPaperMC;
