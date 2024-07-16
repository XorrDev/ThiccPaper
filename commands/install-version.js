const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to download the latest PaperMC build for a specific version
const downloadLatestPaperMC = async (version) => {
    const api = 'https://papermc.io/api/v2';
    const projectName = 'paper'; // Project name

    try {
        // Fetch builds for the specified version
        const buildsResponse = await axios.get(`${api}/projects/${projectName}/versions/${version}/builds`);
        if (!buildsResponse.data || !Array.isArray(buildsResponse.data.builds)) {
            throw new Error(`Invalid or empty response from PaperMC API for version ${version}`);
        }

        // Extract builds array from the response
        const builds = buildsResponse.data.builds;

        if (builds.length === 0) {
            throw new Error(`No builds found for PaperMC version ${version}`);
        }

        // Sort builds by build number in descending order to get the latest build
        const sortedBuilds = builds.sort((a, b) => b.build - a.build);

        // Select the latest build
        const latestBuild = sortedBuilds[0].build;

        // Construct download URL
        const downloadUrl = `${api}/projects/${projectName}/versions/${version}/builds/${latestBuild}/downloads/${projectName}-${version}-${latestBuild}.jar`;

        // Log the download URL
        console.log(`Download URL for PaperMC version ${version}: ${downloadUrl}`);

        // Download the file
        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream' // Ensure response is treated as a stream
        });

        // Define download directory path
        const downloadDir = path.join(__dirname, `../paper-installations/${projectName}-${version}-${latestBuild}`);

        // Ensure the directory exists, create it if it doesn't
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
            console.log(`Created directory: ${downloadDir}`);
        }

        // Define download path and save the file
        const downloadPath = path.join(downloadDir, `${projectName}-${version}-${latestBuild}.jar`);
        console.log(`Downloading to: ${downloadPath}`);

        const writer = fs.createWriteStream(downloadPath);

        response.data.pipe(writer);

        // Return promise for download completion
        await new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Downloaded ${downloadPath} successfully.`);
                resolve(downloadPath); // Resolve with the downloaded file path
            });
            writer.on('error', (err) => {
                console.error('Error writing file:', err.message);
                reject(err);
            });
        });

        // Update package.json after download is complete
        const newVersion = `${projectName}-${version}-${latestBuild}`;
        updatePackageJson(newVersion);

        return downloadPath; // Return the downloaded file path

    } catch (error) {
        console.error('Error downloading PaperMC server JAR:', error.message);
        throw error; // Propagate the error to handle it outside
    }
};

// Function to update current-paper-version in package.json
const updatePackageJson = (newVersion) => {
    const packageJsonPath = path.join(__dirname, '../package.json'); // Adjust the path if needed

    // Read current package.json contents
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Update current-paper-version
    packageJson['current-paper-version'] = newVersion;

    // Write updated package.json back to file
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(`Updated current-paper-version to ${newVersion} in package.json`);
};

// Parse command line arguments
const args = process.argv.slice(2); // Exclude 'node' and 'main.js'

// Handle commands
if (args[0] === 'install-version' && args[1]) {
    const version = args[1];
    downloadLatestPaperMC(version)
        .then((downloadedFilePath) => {
            console.log(`Download for PaperMC version ${version} completed successfully.`);
        })
        .catch((error) => {
            console.error('Download failed:', error.message);
        });
} else {
    console.error('Invalid command. Usage: node main.js install-version <version>');
}
