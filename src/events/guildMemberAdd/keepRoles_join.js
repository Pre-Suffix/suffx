const { Client, GuildMember, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../../models/serverModel");
const memberModel = require("../../models/memberModel");

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

    let user = await memberModel.findOne({
        guildId: member.guild.id,
        userId: member.id
    });

    if(!server || !user) return;

    if(server.keepRoles != true || (user.leftWithRoles ?? []).length == 0) return;

    try {
        user.leftWithRoles.forEach(async (r) => {
            let role = member.guild.roles.cache.find((x) => x.id == r);
            if(member.guild.members.me.roles.highest.comparePositionTo(r) >= 1 && typeof role != "undefined")
                await member.roles.add(r).catch((e) => console.log("keepRoles_join.js: ", e));
        });
    } catch (error) {
        console.log("keepRoles_join.js: ", error)
    }

}