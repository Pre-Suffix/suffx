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

    let track = session.queue[0];
    let musicCount = session.queue.length + session.pastSongs.length;
    let loopMode = new Map([["none", "Disabled"], ["track", "Track"], ["queue", "Queue"]]);
    interaction.reply({ embeds: [
        new Discord.EmbedBuilder()
        .setTitle("🎶 Music Session stats")
        .setFields(...[
            {
                name: "⌚ Started",
                value: `<t:${session.startTS}:R>`,
                inline: true
            }, {
                name: "💿 Musics on queue",
                value: musicCount + " music" + (musicCount > 1 ? "s" : ""),
                inline: true
            }, {
                name: "🔁 Looping Mode",
                value: loopMode.get(session.loopMode).toString(),
                inline: true
            }, {
                name: "📻 Playing on",
                value: `<#${session.voiceChannel.id}>`,
                inline: true
            }, {
                name: "💬 Text Channel",
                value: `<#${session.textChannel.id}>`,
                inline: true
            }, {
                name: "🎚️ Volume",
                value: session.volume + "%",
                inline: true
            }, {
                name: (session.loopMode == "track" ? "🔂 On Repeat" : "🔈 Now Playing"),
                value: `[\`${track.live ? "🔴 Live` `" : ""}${track.name}\`](${track.youtubeLink ? track.youtubeURL : track.url}) • <@${track.requestedBy}>`
                + (track.duration == null ? "" : ' • ' + toDuration(track.duration)),
                inline: false
            }
        ])
        .setColor(process.env.SUFFXCOLOR)
        .setImage(track.youtubeThumbnail ?? null)
    ]});
}