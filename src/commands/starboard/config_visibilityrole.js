const { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../../models/serverModel");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        interaction.reply("You don't have enough permissions to run this command.");
        return;
    }

    let server = await serverModel.findOne({
        guildId: interaction.guild.id
    });

    if(!server) {
        interaction.reply("There was a problem retrieving server info.");
        return;
    } else if(!server.starboard.active) {
        interaction.reply("The starboard isn't active. Activate it before configuring it.");
        return;
    }

    let visibilityRole = interaction.options.getRole("role");

    server.starboard.visibilityRole = visibilityRole.id;

    server.save()
    .then(() => interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setDescription("Starboard settings have been updated.")
            .addFields({
                name: "New vis. role:",
                value: `<@&${server.starboard.visibilityRole}>`
            })
        ]
    }))
    .catch((e) => {
        interaction.reply("There was an error saving server config.");
        console.log("config_stars.js: ", e);
    });    
}