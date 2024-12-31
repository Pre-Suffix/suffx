const { EmbedBuilder, Client, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");
const toDuration = require("./utils/toDuration");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    let constructor = constructors.get(interaction.guild.id);
        
    if(constructor.queue.length == 0) {
        interaction.editReply({ embeds: [ errorEmbed("There are no songs in the queue.", null) ] });
    } else {
        let desc = [];
        let queue = constructor.queue;

        queue.forEach((x, i) => {
            if(i < 9) {
                desc.push(
                    `${i == 0 ? "> **Now playing:**" : "**" + i + ".**"} [\`${x.live ? "🔴 Live` `" : ""}${x.name}\`](${x.youtubeLink ? x.youtubeURL : x.url}) • <@${x.requestedBy}>`
                    + (x.duration == null ? "" : ` • \`${toDuration(x.duration)}\``)
                );
            }
        });

        const embed = new EmbedBuilder()
        .setColor(process.env.SUFFXCOLOR)
        .setDescription(desc.join("\n\n"));

        let row = false;

        if(queue.length > 9) {
            embed.setAuthor({ name: "Page 1/" + Math.ceil((queue.length - 1) / 8) });
            row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("mu_lastpage_1")
                .setLabel("Previous page")
                .setEmoji("◀️")
                .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                .setCustomId("mu_nextpage_1")
                .setLabel("Next page")
                .setEmoji("▶️")
                .setStyle(ButtonStyle.Primary)
            );
        }

        if(constructor.onRepeat) embed.setFooter({ text: `🔁 Looping is enabled. The queue will restart from the beginning after the last track ends.` });

        if(!row) interaction.editReply({ embeds: [ embed ]});
        else interaction.editReply({ embeds: [ embed ], components: [ row ] });
    }
}