const { Client, GuildMember, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../../models/serverModel");
const xpModel = require("../../models/xpModel");

/**
 * 
 * @param { Client } client 
 * @param { GuildMember } member 
 */

module.exports = async (client, member) => {
    if(!member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) return;

    let server = await serverModel.findOne({
        guildId: member.guild.id
    });

    let xp = await xpModel.findOne({
        guildId: member.guild.id,
        userId: member.id
    });

    if(!server || !xp) return;

    if(server.keepRoles != true || (xp.leftWithRoles ?? []).length == 0) return;

    try {
        xp.leftWithRoles.forEach(async (r) => {
            let role = member.guild.roles.cache.find((x) => x.id == r);
            if(member.guild.members.me.roles.highest.comparePositionTo(r) >= 1 && typeof role != "undefined")
                await member.roles.add(r).catch((e) => console.log("keepRoles_join.js: ", e));
        });
    } catch (error) {
        console.log("keepRoles_join.js: ", error)
    }

}