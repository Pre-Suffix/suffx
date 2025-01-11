const { Client, GuildMember, PermissionFlagsBits } = require("discord.js");
const memberModel = require("../../models/memberModel");

/**
 * 
 * @param { Client } client 
 * @param { GuildMember } oldMember 
 * @param { GuildMember } newMember 
 */

module.exports = async (client, oldMember, newMember) => {
    await memberModel.findOneAndUpdate({
        userId: newMember.id,
        guildId: newMember.guild.id
    }, {
        admin: newMember.permissions.has(PermissionFlagsBits.Administrator) ?? false
    });
}