const { Client, Message } = require("discord.js");
const serverModel = require("../../models/serverModel");
let checkedGuilds = new Set();

/**
 * 
 * @param { Client } client 
 * @param { Message } message 
 */

module.exports = async (client, message) => {
    if(!message.inGuild() || checkedGuilds.has(message.guild.id)) return;

    checkedGuilds.add(message.guild.id);

    try {
        let guild = await serverModel.findOne({
            guildId: String(message.guild.id)
        });
    
        if(!guild) {
            serverModel.create({
                guildId: String(message.guild.id),
                levelRoles: [],
                autoRoles: [],
                logChannel: "none",
                serverName: message.guild.name
            });
        }
    } catch (err) {
        console.log("guild.js: ", err);   
    }
}