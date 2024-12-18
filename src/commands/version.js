const { EmbedBuilder } = require("discord.js");
const versionInfo = require("../json/version.json");

module.exports = {
    name: "version",
    description: "Retrieves the bot's current version and changelog.",
    options: [],
    permissionsRequired: [],

    callback: (client, interaction) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`Running v${versionInfo.version} build ${versionInfo.build}`)
                .setDescription(`*codename ${versionInfo.codename}*`)
                .addFields([
                    {
                        name: "Changelog",
                        value: versionInfo.changelog
                    }
                ])
                .setColor(process.env.SUFFXCOLOR)
            ]
        })
    }
}