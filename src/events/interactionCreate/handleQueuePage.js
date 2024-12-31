const { Client, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const constructors = require("../../commands/music/utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");
const toDuration = require("../../commands/music/utils/toDuration");

/**
 * 
 * @param { Client } client 
 * @param { ButtonInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!interaction.isButton()) return;

    let interactionID = String(interaction.customId);
    if(!interactionID.startsWith("mu_")) return;

    let constructor = constructors.get(interaction.guild.id) ?? false;
    let queue = [ ...constructor.queue ];
    if(!constructor) {
        interaction.update({ embeds: [ errorEmbed("There is no music session active.") ], components: [] });
        return;
    } else if(constructor.queue.length <= 9) {
        let desc = [];
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

        if(constructor.onRepeat) embed.setFooter({ text: `🔁 Looping is enabled. The queue will restart from the beginning after the last track ends.` });

        interaction.update({ embeds: [embed], components: [] });
        return;
    }

    let nowPlaying = queue.shift();

    nowPlaying = `> **Now playing:** [\`${nowPlaying.live ? "🔴 Live` `" : ""}${nowPlaying.name}\`](${nowPlaying.youtubeLink ? nowPlaying.youtubeURL : x.url}) • <@${nowPlaying.requestedBy}>`
            + (nowPlaying.duration == null ? "" : ` • \`${toDuration(nowPlaying.duration)}\``);

    let pageCount = Math.ceil(queue.length / 8);
    let page = +interactionID.split("_")[2] + (interactionID.startsWith("mu_nextpage") ? 1 : -1);

    if(page == 0) page = Math.ceil(queue.length / 8);
    if(page > Math.ceil(queue.length / 8)) page = 1;

    queue = queue.slice((page - 1) * 8, page * 8);

    let desc = [ nowPlaying ];

    queue.forEach((x, i) =>
        desc.push(
            `${"**" + (i + (page * 8) - 7) + ".**"} [\`${x.live ? "🔴 Live` `" : ""}${x.name}\`](${x.youtubeLink ? x.youtubeURL : x.url}) • <@${x.requestedBy}>`
            + (x.duration == null ? "" : ` • \`${toDuration(x.duration)}\``)
        )
    );

    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId("mu_lastpage_" + page)
        .setLabel("Previous page")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setCustomId("mu_nextpage_" + page)
        .setLabel("Next page")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder()
    .setColor(process.env.SUFFXCOLOR)
    .setDescription(desc.join("\n\n"))
    .setAuthor({ name: `Page ${page}/${pageCount}` });

    if(constructor.onRepeat) embed.setFooter({ text: `🔁 Looping is enabled. The queue will restart from the beginning after the last track ends.` });

    interaction.update({ embeds: [ embed ], components: [ row ] });

}