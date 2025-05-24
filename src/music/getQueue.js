const Discord = require("discord.js");
const errorEmbed = require("../utils/errorEmbed");
const sessionHandler = require("./utils/sessionHandler");
const toDuration = require("../utils/toDuration");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!sessionHandler.sessions.has(interaction.guildId)) {
        interaction.reply({ embeds: [ errorEmbed("There is no session initialized. Add a track using `/music add` to start the session.") ]} );
        return;
    }

    let session = sessionHandler.sessions.get(interaction.guildId);

    if(session.voiceChannel.id != interaction.member.voice?.channel.id || session.textChannel.id != interaction.channel.id) {
        interaction.reply({ embeds: [ errorEmbed(`To use the music functitonality, connect to <#${session.voiceChannel.id}> and send your commands on <#${session.textChannel.id}>.`, "") ] });
        return;
    }

    if(session.queue.length == 0) return interaction.reply({ embeds: [ errorEmbed("There are no songs in the queue", null) ] });

    let description = [];

    for(let i = 0; (i < 10) && (i < session.queue.length); ++i) {
        let item = "";
        let track = session.queue[i];

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
    .setAuthor({ name: "Page 1/" + Math.max(1, Math.ceil((session.queue.length - 1) / 9)) });

    let actionRow = new Discord.ActionRowBuilder()
    .addComponents(
        new Discord.ButtonBuilder()
        .setCustomId("ms_refresh_1")
        .setLabel("Refresh")
        .setEmoji("🔃")
        .setStyle(Discord.ButtonStyle.Success)
    );

    if(session.queue.length > 10)
        actionRow.addComponents(
            new Discord.ButtonBuilder()
            .setCustomId("ms_lastpage_1")
            .setLabel("Previous Page")
            .setEmoji("◀️")
            .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
            .setCustomId("ms_nextpage_1")
            .setLabel("Next Page")
            .setEmoji("▶️")
            .setStyle(Discord.ButtonStyle.Primary)
        );
    
    if(session.loopMode == "queue") embed.setFooter({ text: "🔁 Queue looping is enabled. Once the last track ends, playback will restart from the beginning." });

    interaction.reply({ embeds: [ embed ], components: [ actionRow ] });
}