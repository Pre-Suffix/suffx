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
    } else if(!interaction.member.roles.cache.has(soapbox.eligibilityRole)) {
        interaction.reply("You don't have the required role to join the Soapbox.");
        return;
    } else if(soapbox.userList.includes(interaction.user.id)) {
        interaction.reply("You have already opted-in to the Soapbox.");
        return;
    }

    soapbox.userList.push(interaction.user.id);

    await soapbox.save();

    interaction.reply("You have opted-in to the Soapbox" + (
        soapbox.alreadyTalked.includes(interaction.user.id) ?
        " (Note: You have already talked in the current soapbox session, as such you'll only be picked again after all other users have done so)." : "."
    ));
};