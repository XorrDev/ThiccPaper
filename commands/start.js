const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to start the PaperMC server
const startPaperMC = (args) => {
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

    // Check and update eula.txt
    const eulaPath = path.join(versionDir, 'eula.txt');
    if (fs.existsSync(eulaPath)) {
        const eulaContent = fs.readFileSync(eulaPath, 'utf8');
        if (!eulaContent.includes('eula=true')) {
            console.log(`Updating eula.txt in ${versionDir}`);
            fs.writeFileSync(eulaPath, 'eula=true\n');
        }
    } else {
        console.error(`eula.txt not found in ${versionDir}`);
        return;
    }

    // Update server.properties to enable RCON
    const serverPropertiesPath = path.join(versionDir, 'server.properties');
    if (fs.existsSync(serverPropertiesPath)) {
        let serverProperties = fs.readFileSync(serverPropertiesPath, 'utf8');
        serverProperties = serverProperties.replace('enable-rcon=false', 'enable-rcon=true');
        fs.writeFileSync(serverPropertiesPath, serverProperties);
        // Set the rcon.password value directly
        serverProperties = serverProperties.replace(/^rcon.password=.*/m, 'rcon.password=thiccpaper');

        // Write back the modified server.properties file
        fs.writeFileSync(serverPropertiesPath, serverProperties);
    } else {
        console.error(`server.properties not found in ${versionDir}`);
        return;
    }

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
        stdio: 'ignore'  // Ignore stdin, stdout, and stderr
    });

    console.log(`Started PaperMC server (${currentVersion}) with ${memory} memory allocation`);

    // Wait a bit to allow server to start
    setTimeout(() => {
        console.log('Server has started');
        process.exit(0); // Exit the script while leaving the server process running
    }, 10000); // Adjust delay as needed to ensure server has started

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
