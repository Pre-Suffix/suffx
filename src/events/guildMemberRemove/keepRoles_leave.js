const { Client, GuildMember } = require("discord.js");
const serverModel = require("../../models/serverModel");
const xpModel = require("../../models/xpModel");

/**
 * 
 * @param { Client } client 
 * @param { GuildMember } member 
 */

module.exports = async (client, member) => {
    let server = await serverModel.findOne({
        guildId: member.guild.id
    });

    let xp = await xpModel.findOne({
        guildId: member.guild.id,
        userId: member.id
    });

    if(!server || !xp) return;

    if(server.keepRoles != true) return;

    xp.leftWithRoles = [];

    member.roles.cache.forEach((x) => { if(x.name != "@everyone") xp.leftWithRoles.push(x.id); });

    xp.save();

}