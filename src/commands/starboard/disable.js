const { Client, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../../models/serverModel");
const starModel = require("../../models/starModel");

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
    }

    if(server.starboard?.active == false) { 
        interaction.reply("The starboard is already disabled.");
        return;
    }

    server.starboard.active = false;

    await starModel.deleteMany({
        guildId: interaction.guild.id
    });

    server.save()
    .then(() => {
        interaction.reply("The starboard has been successfully disabled.");
    })
    .catch((e) => {
        interaction.reply("There was an error saving the server data.");
        console.log("disable.js: ", e);
    })
}