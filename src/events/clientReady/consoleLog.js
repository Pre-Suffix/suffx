const { ActivityType } = require("discord.js");
const version = require("../../json/version.json");

module.exports = (client) => {
    console.log("• Bot connected to Discord.");

    client.user.setActivity({
        name: `SuffX v${version.version}b${version.build}`,
        type: ActivityType.Playing
    });
}