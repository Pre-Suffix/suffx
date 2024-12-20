const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const serverModel = require("../../models/serverModel");
const starModel = require("../../models/starModel");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    let messageCount = await starModel.countDocuments({
        guildId: interaction.guild.id
    });
    let server = await serverModel.findOne({
        guildId: interaction.guild.id
    });

    if(!server) { 
        interaction.reply("There was an issue fetching server data.");
        return;
    } else if(!server.starboard.active) {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: "Starboard Stats"
                })
                .setColor("Yellow")
                .setDescription("🟥 Not Active")
            ]
        });
    } else {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: "Starboard Stats"
                })
                .setColor("Yellow")
                .setDescription(
                    `🟩 Active\n============================\n
                    ${server.starboard.reactionEmoji.emoji} Minimum Reactions: ${server.starboard.minStars}\n
                    🌟 Special Emojis: ${server.starboard.emojis.length}\n
                    📜 Channel: <#${server.starboard.channelId}>\n
                    💬 Messages: ${messageCount ?? 0}\n
                    👁️ Visibility Role: <@&${server.starboard.visibilityRole}>`
                )
            ]
        });
    }


    
}