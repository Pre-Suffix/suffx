const { Client, Message, EmbedBuilder } = require("discord.js");
const serverModel = require("../../models/serverModel");

/**
 * 
 * @param { Client } client 
 * @param { Message } message 
 */

module.exports = async (client, message) => {
    if(message.partial || !message?.guild) return;

    let server = await serverModel.findOne({
        guildId: message.guild.id
    });

    if(!server) return;
    if(server.logChannel == "none" || server.logChannel == null) return;

    let logChannel = await message.guild.channels.fetch(server.logChannel);

    if(typeof logChannel.send != "function" || !logChannel) return;

    let messageEmbed = new EmbedBuilder()
    .setAuthor({
        name: message.author.tag,
        iconURL: message.author.avatarURL()
    })
    .setColor("Red")
    .setDescription(message.content.length == 0 ? null : message.content)
    .setTimestamp(message.createdAt);

    let files = [];

    message.attachments.forEach((x) => {
        if(x.url) files.push(x.url);
    });

    logChannel.send({
        content: `Message deleted on <#${message.channel.id}>`,
        embeds: [
            messageEmbed,
            ...message.embeds
        ],
        files
    });
}