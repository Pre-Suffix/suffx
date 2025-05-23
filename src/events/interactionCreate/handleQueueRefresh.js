const Discord = require("discord.js");
const sessionHandler = require("../../music/utils/sessionHandler");
const errorEmbed = require("../../utils/errorEmbed");
const toDuration = require("../../utils/toDuration");

/**
 * Handles button interactions on a Music Session's queue.
 * @param { Discord.Client } client 
 * @param { Discord.ButtonInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    if(!interaction.isButton()) return;

    const interactionID = interaction.customId.toString();
    if(!interactionID.startsWith("ms_refresh")) return;

    if(!sessionHandler.sessions.has(interaction.guildId)) 
        return interaction.message.delete();

    let session = sessionHandler.sessions.get(interaction.guildId);
    let queue = [ ...session.queue ];

    if(queue.length == 0)
        return interaction.update({ embeds: [ errorEmbed("Queue is empty.", null) ], components: [] });

    let pageCount = Math.ceil((queue.length - 1) / 9);
    let page = +interactionID.split("_").pop();

    if(page > pageCount) page = 1;

    
    let description = [];

    for(let i = (page - 1) * 10; (i < (page * 10)) && (i < session.queue.length); ++i) {
        let item = "";
        let track = queue[i];

        if(i == 0 && session.loopMode == "track") item += "> **🔂 On repeat:** ";
        else if(i == 0) item += "> **▶️ Now playing:** "
        else item += `**${i}.** `

        if(track.live) item += `[\`🔴 Live\` \`${track.name}\`]`;
        else item += `[\`${track.name}\`]`;

        if(track.youtubeLink) item += '(' + track.youtubeURL + ')';
        else item += '(' + track.url + ')';

        item += ` • <@${track.requestedBy}>`;

        if(!!track.duration) item += ` • \`${toDuration(track.duration)}\``;

        description.push(item);
    }

    const embed = new Discord.EmbedBuilder()
    .setColor(process.env.SUFFXCOLOR)
    .setDescription(description.join("\n\n"))
    .setAuthor({ name: `Page ${page}/${pageCount}` });

    let actionRow = new Discord.ActionRowBuilder()
    .addComponents(
        new Discord.ButtonBuilder()
        .setCustomId("ms_refresh_" + page)
        .setLabel("Refresh")
        .setEmoji("🔃")
        .setStyle(Discord.ButtonStyle.Success)
    );

    if(session.queue.length > 10)
        actionRow.addComponents(
            new Discord.ButtonBuilder()
            .setCustomId("ms_lastpage_" + page)
            .setLabel("Previous Page")
            .setEmoji("◀️")
            .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
            .setCustomId("ms_nextpage_" + page)
            .setLabel("Next Page")
            .setEmoji("▶️")
            .setStyle(Discord.ButtonStyle.Primary)
        );
    
    if(session.loopMode == "queue") embed.setFooter({ text: "🔁 Queue looping is enabled. Once the last track ends, playback will restart from the beginning." });

    interaction.update({ embeds: [ embed ], components: [ actionRow ] });
}