const serverModel = require("../../models/serverModel");
const { GuildMember, Client, PermissionFlagsBits } = require("discord.js");

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

    if(!server) return;

    try {
        if(server.autoRoles.length > 0)
            server.autoRoles.forEach(async (r) => {
                if(member.guild.members.me.roles.highest.comparePositionTo(r) >= 1)
                    await member.roles.add(r);
            });
    } catch (error) {
        console.log("autoroleGive.js: ", error);
    }
}