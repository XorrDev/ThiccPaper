<img style="float: right;" src="ThiccPaperBanner.png">

## A Lightweight PaperMC Overhead Utility

"Thicc Paper" is a utility program tailored for Minecraft server administrators and enthusiasts. It facilitates the installation, management, and operation of Minecraft servers running on the PaperMC software. The program automates tasks such as downloading the latest PaperMC builds, configuring server properties, starting and stopping server instances, and managing server-related files like `server.properties` and `eula.txt`. It integrates functionalities to ensure smooth server operations, including remote console (RCON) access and server process monitoring.

## Key Features and Functionality
- **Installation and Updates**: Automates the download and installation of the latest PaperMC builds.
- **Configuration Management**: Manages server properties (`server.properties`), ensuring proper settings for gameplay and administration.
- **Server Process Control**: Starts, stops, and monitors Minecraft server instances, handling server lifecycle management.
- **Remote Management**: Enables remote server administration through RCON, facilitating commands and management tasks from a remote console.
- **Integration with Minecraft Ecosystem**: Aligns with the Minecraft community by supporting popular server software (PaperMC) and adhering to server administration best practices.


## Installing

Paste the following in a debian-based linux terminal and watch the magic happen :)
```bash
cd /srv/
sudo git clone https://github.com/XorrDev/ThiccPaper.git
cd ThiccPaper
chmod +x thiccpaper-linux-install.sh
./thiccpaper-linux-install.sh
```
