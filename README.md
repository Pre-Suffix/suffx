<h1 align="center">
  <br>
  <a href="https://github.com/Pre-Suffix"><img src="./SuffX.png" height="200" alt="SuffX Logo" style="clip-path: circle();"></a>
  <br>
  SuffX Discord Bot
  <br>
</h1>

<p align="center">A general utilitarian Discord bot</p>

<br>

<p align="center">
  <a href="#-resource-links">Resource Links</a>
  •
  <a href="#-prerequisites">Prerequisites</a>
  •
  <a href="#-getting-started">Getting Started</a>
  •
  <a href="https://github.com/Pre-Suffix/suffx/wiki">Features</a>
</p>

<br>

## 🔗 Resource Links

- 🤖 Bot: [Invite Here](https://discord.com/oauth2/authorize?client_id=765366636571131944&permissions=1376805842000&integration_type=0&scope=bot%20applications.commands)
- 📂 Documentation: [Visit Here](https://github.com/Pre-Suffix/suffx/wiki)

## 📦 Prerequisites

- [Node.js](https://nodejs.org/en/) v18.17.0 or higher
- [Git](https://git-scm.com/downloads)
- [MongoDB](https://www.mongodb.com)
- [FFMPEG](https://ffmpeg.org/)

## 🚀 Getting Started

- Open the terminal and run the following commands

```
git clone https://github.com/Pre-Suffix/suffx.git
cd suffx
mkdir chatlogs
npm install
```

- Wait for all the dependencies to be installed
- Rename `.env_example` to `.env` and fill the values
- Type `npm run start` to start the bot

## ❗ Known Issues

- Depending on where the bot is installed, the music functionality will not work. Some troubleshooting steps are:
  - check whether FFMPEG is installed
  - uninstall and re-install the NPM package "ffmpeg-static"
  - uninstall and re-install the NPM package "opusscript"
  - uninstall "opusscript" and install "@discordjs/opus" (requires build tools)

If none of the above steps work, open an issue in the issues tab.