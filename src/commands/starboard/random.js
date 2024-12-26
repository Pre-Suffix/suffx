const { Client, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const random = require("../../utils/random");
const starModel = require("../../models/starModel");
const serverModel = require("../../models/serverModel");
const getImage = require("../../utils/getImage");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    await interaction.deferReply();
    let filter = {
        guildId: interaction.guild.id
    };
    let user = interaction.options.getUser("user");
    let channel = interaction.options.getChannel("channel");

    if(channel) filter["channelId"] = channel.id;

    let star = await starModel.find(filter);

    if(star && user) star.filter((x) => x.message.userId == user.id);

    if((star ?? []).length == 0) {
        interaction.editReply({
            content: "No starboard messages were found."
        });
        return;
    }

    try {
        star = star[random(0, star.length - 1)];

        if(!channel) channel = await interaction.guild.channels.fetch(star.channelId);

        let message = await channel.messages.fetch(star.message.messageId);
    
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
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${star.channelId}/${star.message.messageId}`)
            .setLabel("Original Message")
            .setStyle(ButtonStyle.Link)
        ];

        if(star.replyingTo?.messageId) {
            let replyMessage = await channel.messages.fetch(star.replyingTo.messageId);

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
                .setURL(`https://discord.com/channels/${interaction.guild.id}/${star.channelId}/${star.replyingTo.messageId}`)
                .setLabel("Referenced Message")
                .setStyle(ButtonStyle.Link)
            );
        }

        let row = new ActionRowBuilder()
        .addComponents(buttons);

        let server = await serverModel.findOne({
            guildId: interaction.guild.id
        });

        interaction.editReply({
            content: `**${server.starboard.reactionEmoji.emoji} ${star.stars}** | <#${star.channelId}>`,
            embeds,
            components: [ row ]
        });

    } catch (error) {
        interaction.editReply("There was an error processing your request.");
        console.log("random.js: ", error);
    }

}