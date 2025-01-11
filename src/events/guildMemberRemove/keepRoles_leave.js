const { Client, GuildMember } = require("discord.js");
const serverModel = require("../../models/serverModel");
const memberModel = require("../../models/memberModel");

/**
 * 
 * @param { Client } client 
 * @param { GuildMember } member 
 */

module.exports = async (client, member) => {
    let server = await serverModel.findOne({
        guildId: member.guild.id
    });

    let user = await memberModel.findOne({
        guildId: member.guild.id,
        userId: member.id
    });

    if(!server || !user) return;

    if(server.keepRoles != true) return;

    user.leftWithRoles = [];

    member.roles.cache.forEach((x) => { if(x.name != "@everyone") user.leftWithRoles.push(x.id); });

    user.save();

}