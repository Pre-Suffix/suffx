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
    if(server.logging?.active == false || !server.logging || server.logging?.messageEdit == false) return;

    let logChannel = await oldMessage.guild.channels.fetch(server.logging.channelId);

    if(typeof logChannel.send != "function" || !logChannel) return;

    let beforeMessage = new EmbedBuilder()
    .setAuthor({
        name: "(Before) " + newMessage.author.tag,
        iconURL: newMessage.author.avatarURL(),
        url: `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`
    })
    .setColor("Yellow")
    .setDescription(oldMessage.content.length == 0 ? null : oldMessage.content)
    .setTimestamp(oldMessage.createdAt);

    let afterMessage = new EmbedBuilder()
    .setAuthor({
        name: "(After) " + newMessage.author.tag,
        iconURL: newMessage.author.avatarURL(),
        url: `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`
    })
    .setColor("Green")
    .setDescription(newMessage.content.length == 0 ? null : newMessage.content)
    .setTimestamp();

    logChannel.send({
        content: `Message edited. https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`,
        embeds: [
            beforeMessage,
            afterMessage
        ]
    });
}