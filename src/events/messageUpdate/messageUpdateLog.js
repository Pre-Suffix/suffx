const { Client, Message, EmbedBuilder } = require("discord.js");
const serverModel = require("../../models/serverModel");

/**
 * 
 * @param { Client } client 
 * @param { Message } oldMessage 
 * @param { Message } newMessage 
 */

module.exports = async (client, oldMessage, newMessage) => {
    if(oldMessage.partial || newMessage.partial || oldMessage?.content == newMessage?.content || !oldMessage?.guild || oldMessage.interaction != null) return;

    let server = await serverModel.findOne({
        guildId: oldMessage.guild.id
    });

    if(!server) return;
    if(server.logChannel == "none" || typeof server.logChannel != "string") return;

    let logChannel = await oldMessage.guild.channels.fetch(server.logChannel);

    if(typeof logChannel.send != "function" || !logChannel) return;

    let beforeMessage = new EmbedBuilder()
    .setAuthor({
        name: "(Before) " + oldMessage.author.tag,
        iconURL: oldMessage.author.avatarURL(),
        url: `https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id}`
    })
    .setColor("Yellow")
    .setDescription(oldMessage.content.length == 0 ? "*The message has no content.*" : oldMessage.content)
    .setTimestamp(oldMessage.createdAt);

    let afterMessage = new EmbedBuilder()
    .setAuthor({
        name: "(After) " + oldMessage.author.tag,
        iconURL: oldMessage.author.avatarURL(),
        url: `https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id}`
    })
    .setColor("Green")
    .setDescription(newMessage.content.length == 0 ? "*The message has no content.*" : newMessage.content)
    .setTimestamp();

    logChannel.send({
        content: `Message edited. https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id}`,
        embeds: [
            beforeMessage,
            afterMessage
        ]
    });
}