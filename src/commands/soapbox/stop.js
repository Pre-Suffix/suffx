const { Client, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const soapboxModel = require("../../models/soapboxModel");

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

    let soapbox = await soapboxModel.findOne({
        guildId: interaction.guild.id
    });

    if(!soapbox) {
        interaction.reply("There is no soapbox instance configured in this server.");
        return;
    } else if(!soapbox.started) {
        interaction.reply("This soapbox instance has already been deactivated.");
        return;
    }

    soapbox.started = false;
    soapbox.steppedOn = -Math.abs(soapbox.steppedOn - Math.round(Date.now() / 1000));

    await soapbox.save();

    interaction.reply("Soapbox instance has been deactivated.");

};