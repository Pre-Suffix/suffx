const { Client, MessageReaction, User } = require("discord.js");
const serverModel = require("../../models/serverModel");
const starModel = require("../../models/starModel");


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
            console.log("starboardReactionRemove.js: ", error);
            return;
        }
    }

    let message = reaction.message;
    if(!message.inGuild()) return;

    let server = await serverModel.findOne({
        guildId: message.guild.id
    });

    if(!server || !server?.starboard.active) return;

    try {
        let emoji = reaction.emoji.id == null ? reaction.emoji.name : `<${reaction.emoji.animated ? "a" : ""}:${reaction.emoji.name}:${reaction.emoji.id}>`;
        let count = (await reaction.users.fetch()).size;

        if(server.starboard.reactionEmoji.emoji != emoji) return;

        let star = await starModel.findOne({
            message: {
                messageId: message.id,
                userId: message.author.id
            }
        });

        if(!star) return;
        if(star.starboardMessageId == null) return;

        let channel = await message.guild.channels.fetch(server.starboard.channelId);
        let sbmessage = await channel.messages.fetch(star.starboardMessageId);


        if(count >= server.starboard.minStars) {
            star.stars = count;

            let em = server.starboard.reactionEmoji.emoji;

            server.starboard.emojis.forEach((x) => { if(x.minStars <= count) em = x.emoji });

            await sbmessage.edit({
                content: `**${em} ${count}** | <#${star.channelId}>`
            });

            await star.save();
        } else {
            await star.deleteOne();

            sbmessage.delete();
        }


    } catch(error) {
        console.log("starboardReactionRemove.js: ", error);
    }
    
}