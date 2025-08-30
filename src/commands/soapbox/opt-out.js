const { Client, CommandInteraction } = require("discord.js");
const soapboxModel = require("../../models/soapboxModel");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    let soapbox = await soapboxModel.findOne({
        guildId: interaction.guild.id
    });

    if(!soapbox) {
        interaction.reply("There is no soapbox instance configured in this server.");
        return;
    } else if(!soapbox.userList.includes(interaction.user.id)) {
        interaction.reply("You have already opted-out of the Soapbox.");
        return;
    } /*else if(soapbox.soapboxUser == interaction.user.id) {
        interaction.reply("You cannot opt-out of the Soapbox while you're on it. First, run /soapbox skip-round and then run this command again.");
        return;
    }*/

    soapbox.userList.splice(soapbox.userList.indexOf(interaction.user.id), 1);

    await soapbox.save();

    interaction.reply("You have opted-out of the Soapbox.");
};