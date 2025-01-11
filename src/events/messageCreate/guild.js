const { Client, Message, PermissionFlagsBits } = require("discord.js");
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
                active: true,
                logging: {
                    active: false,
                    channelId: "none",
                    messageEdit: true,
                    messageDelete: true
                },
                levelRoles: [],
                starboard: {
                    active: false,
                    channelId: null,
                    minStars: 5,
                    visibilityRole: null,
                    reactionEmoji: {
                        emoji: "⭐",
                        defaultEmoji: true
                    },
                    emojis: []
                },
                guild: {
                    name: String(message.guild.name),
                    iconURL: message.guild.iconURL() ?? message.guild.nameAcronym
                },
                autoRoles: [],
                keepRoles: false,
            });
        } else {
            guild.guild.name = String(message.guild.name);
            guild.guild.iconURL = message.guild.iconURL() ?? message.guild.nameAcronym;

            guild.save();
        }
    } catch (err) {
        console.log("guild.js: ", err);   
    }
}