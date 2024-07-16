const fs = require('fs');
const path = require('path');

// Function to set the current paper version based on installations
const setPaperVersion = (args) => {
    const installationsDir = path.join(__dirname, '../paper-installations');

    // Validate command arguments
    if (args.length < 1) {
        console.error('Please provide a valid PaperMC version (e.g., paper-1.20-17)');
        return;
    }

    const requestedVersion = args[0];

    // Check if the requested version directory exists in paper-installations
    const versionDir = path.join(installationsDir, requestedVersion);

    if (!fs.existsSync(versionDir)) {
        console.error(`Version ${requestedVersion} not found in paper-installations.`);
        return;
    }

    // Set the new version in package.json
    const newVersion = requestedVersion;
    updatePackageJson(newVersion);
};

// Function to update current-paper-version in package.json
const updatePackageJson = (newVersion) => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson['current-paper-version'] = newVersion;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`Updated current-paper-version to ${newVersion} in package.json`);
    } catch (error) {
        console.error('Error updating package.json:', error.message);
    }
};

// Export execute function
module.exports.execute = setPaperVersion;
