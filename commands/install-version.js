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

        // Create eula.txt
        const eulaPath = path.join(downloadDir, 'eula.txt');
        if (!fs.existsSync(eulaPath)) {
            fs.writeFileSync(eulaPath, 'eula=true\n');
            console.log(`Created eula.txt with eula=true in ${downloadDir}`);
        }

        // Create server.properties
        const serverPropertiesPath = path.join(downloadDir, 'server.properties');
        if (!fs.existsSync(serverPropertiesPath)) {
            const serverPropertiesContent = `#Minecraft server properties
#Tue Jul 16 00:10:49 PDT 2024
accepts-transfers=false
allow-flight=false
allow-nether=true
broadcast-console-to-ops=true
broadcast-rcon-to-ops=true
bug-report-link=
debug=false
difficulty=easy
enable-command-block=false
enable-jmx-monitoring=false
enable-query=false
enable-rcon=true
enable-status=true
enforce-secure-profile=true
enforce-whitelist=false
entity-broadcast-range-percentage=100
force-gamemode=false
function-permission-level=2
gamemode=survival
generate-structures=true
generator-settings={}
hardcore=false
hide-online-players=false
initial-disabled-packs=
initial-enabled-packs=vanilla
level-name=world
level-seed=
level-type=minecraft\\:normal
log-ips=true
max-chained-neighbor-updates=1000000
max-players=20
max-tick-time=60000
max-world-size=29999984
motd=A ThiccPaper Server
network-compression-threshold=256
online-mode=true
op-permission-level=4
player-idle-timeout=0
prevent-proxy-connections=false
pvp=true
query.port=25565
rate-limit=0
rcon.password=thiccpaper
rcon.port=25575
region-file-compression=deflate
require-resource-pack=false
resource-pack=
resource-pack-id=
resource-pack-prompt=
resource-pack-sha1=
server-ip=
server-port=25565
simulation-distance=10
spawn-animals=true
spawn-monsters=true
spawn-npcs=true
spawn-protection=16
sync-chunk-writes=true
text-filtering-config=
use-native-transport=true
view-distance=10
white-list=false`;
            fs.writeFileSync(serverPropertiesPath, serverPropertiesContent);
            console.log(`Created server.properties in ${downloadDir}`);
        }

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
