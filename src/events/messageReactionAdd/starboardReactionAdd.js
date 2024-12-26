const { Client, MessageReaction, User, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const serverModel = require("../../models/serverModel");
const starModel = require("../../models/starModel");
const getImage = require("../../utils/getImage");

/**
 * 
 * @param { Client } client 
 * @param { MessageReaction } reaction 
 * @param { User } user 
 */

module.exports = async (client, reaction, user) => {

    if(reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.log("starboardReactionAdd.js: ", error);
            return;
        }
    }

    let message = reaction.message;
    if(!message.inGuild()) return;

    let server = await serverModel.findOne({
        guildId: message.guild.id
    });

    if(!server || !server?.starboard.active) return;

    let visibilityRole = await message.guild.roles.fetch(server.starboard.visibilityRole);

    try {
        if(!message.channel.permissionsFor(visibilityRole ?? message.guild.roles.everyone).has("ViewChannel")) return;

        let emoji = reaction.emoji.id == null ? reaction.emoji.name : `<${reaction.emoji.animated ? "a" : ""}:${reaction.emoji.name}:${reaction.emoji.id}>`;
        let count = (await reaction.users.fetch()).size;

        if(server.starboard.reactionEmoji.emoji != emoji || count < server.starboard.minStars) return;

        let starboardChannel = await message.guild.channels.fetch(server.starboard.channelId, {force: true});
        let star = await starModel.findOne({
            message: {
                messageId: message.id,
                userId: message.author.id
            }
        });

        let em = server.starboard.reactionEmoji.emoji;

        server.starboard.emojis.forEach((x) => { if(x.minStars <= count) em = x.emoji });

        if(star) {
            if(star.starboardMessageId == null) return;
            
            let starboardMessage = await starboardChannel.messages.fetch(star.starboardMessageId);
            star.stars = count;

            starboardMessage.edit({
                content: `**${em} ${count}** | <#${star.channelId}>`
            });

            star.save();
        } else {
            let embeds = [
                new EmbedBuilder()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.avatarURL()
                })
                .setDescription(message.content.length == 0 ? null : message.content)
                .setTimestamp(message.createdAt)
                .setImage(getImage(message.attachments))
                .setColor("Yellow")
                
            ];
            
            let buttons = [
                new ButtonBuilder()
                .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`)
                .setLabel("Original Message")
                .setStyle(ButtonStyle.Link)
            ];

            let replyMessage = message.reference == null ? undefined : await message.fetchReference();

            if(replyMessage != undefined) {
                embeds.unshift(
                    new EmbedBuilder()
                    .setAuthor({
                        name: replyMessage.author.tag,
                        iconURL: replyMessage.author.avatarURL()
                    })
                    .setDescription(replyMessage.content.length == 0 ? null : replyMessage.content)
                    .setTimestamp(replyMessage.createdAt)
                    .setImage(getImage(replyMessage.attachments))
                    .setColor("#2b2d31")
                );

                buttons.unshift(
                    new ButtonBuilder()
                    .setURL(`https://discord.com/channels/${replyMessage.guild.id}/${replyMessage.channel.id}/${replyMessage.id}`)
                    .setLabel("Referenced Message")
                    .setStyle(ButtonStyle.Link)
                );
            }

            let row = new ActionRowBuilder()
            .addComponents(buttons);

            let starboardMessage = await starboardChannel.send({
                content: `**${em} ${count}** | <#${message.channel.id}>`,
                embeds,
                components: [ row ]
            });

            starModel.create({
                guildId: message.guild.id,
                channelId: message.channel.id,
                message: {
                    messageId: message.id,
                    userId: message.author.id
                },
                replyingTo: {
                    messageId: replyMessage?.id,
                    userId: replyMessage?.author.id
                },
                starboardMessageId: starboardMessage.id,
                stars: count
            });

        }
    } catch (error) {
        console.log("starboardReactionAdd.js: ", error);
    }
    
    
}