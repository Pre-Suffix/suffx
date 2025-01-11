const { Client, GuildMember } = require("discord.js");
const memberModel = require("../../models/memberModel");

/**
 * 
 * @param { Client } client 
 * @param { GuildMember } member 
 */

module.exports = async (client, member) => {
    await memberModel.findOneAndUpdate({
        userId: member.id,
        guildId: member.guild.id
    }, {
        admin: false
    });
}