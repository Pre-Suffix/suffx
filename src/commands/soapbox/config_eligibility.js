const { Client, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const soapboxModel = require("../../models/soapboxModel");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        interaction.reply("You don't have enough permission to run this command.");
        return;
    } else if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        interaction.reply("To run this command, I need the MANAGE_ROLES permission.");
        return;
    } else if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        interaction.reply("To run this command, I need the MANAGE_CHANNELS permission.");
        return;
    }
    
    let soapbox = await soapboxModel.findOne({
        guildId: interaction.guild.id
    });

    if(!soapbox) {
        interaction.reply("This server has no soapbox instance, run /soapbox setup before using this command.");
        return;
    }

    const role = interaction.options.getRole("role", true);
    soapbox.eligibilityRole = role.id;

    await soapbox.save();

    interaction.reply({
        content: `Settings saved, eligibility role now <@&${role.id}>.`,
        flags: "Ephemeral"
    });
};