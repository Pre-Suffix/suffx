const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../models/serverModel");

module.exports = {
    name: "logging",
    description: "Command for managing server logs. [ADMIN ONLY]",
    options: [
        {
            name: "enable",
            description: "Enables server logging.",
            options: [
                {
                    name: "channel",
                    description: "Channel to use for logging.",
                    required: true,
                    type: ApplicationCommandOptionType.Channel
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "disable",
            description: "Disables server logging.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [
        PermissionFlagsBits.Administrator
    ],

    callback: async (client, interaction) => {
        if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            interaction.reply({
                content: "You need the `ADMINISTRATOR` permission to run this command.",
                ephemeral: true
            });
            return;
        }
        let server = await serverModel.findOne({
            guildId: interaction.guild.id
        });
    
        if(!server) {
            interaction.reply({
                content: "There was a problem retrieving server preferences. Try again later.",
                ephemeral: true
            });
        }
    
        let subcommand = interaction.options.getSubcommand();
    
        if(subcommand === "enable") {
            let channel = interaction.options.getChannel("channel");
    
            server.logChannel = channel.id;
            server.save()
            .catch((e) => {
                interaction.reply({
                    content: "There was a problem saving server preferences."
                });
                console.log("logging.js: ", e);
            })
            .then(() => {
                interaction.reply({
                    content: `Logging is enabled and set to <#${channel.id}>.`
                });
            });
        } else {
            server.logChannel = "none";
            server.save()
            .catch((e) => {
                interaction.reply({
                    content: "There was a problem saving server preferences."
                });
                console.log("logging.js: ", e);
            })
            .then(() => {
                interaction.reply({
                    content: `Logging has been disabled.`
                });
            });
        }
    }
}