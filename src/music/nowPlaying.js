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

    if(session.queue.length < 1 || !session.resource) {
        interaction.reply({ embeds: [ errorEmbed("No track is currently playing.") ] });
        return;
    }

    let track = session.queue[0];
    let fields = [
        {
            name: "Track:",
            value: `[\`${track.name}\`](${track.youtubeLink ? track.youtubeURL : track.url})`,
            inline: true
        }, {
            name: "Requested by:",
            value: `<@${track.requestedBy}>`,
            inline: true
        }
    ];

    if(!!track.duration) fields.push(...[
        {
            name: "Duration:",
            value: '`' + toDuration(track.duration) + '`',
            inline: true
        }, {
            name: "Progress:",
            value: `\`${toDuration(session.resource.playbackDuration / 1000)} [${Array(Math.floor((session.resource.playbackDuration / 1000 / track.duration) * 25)).fill("#").join("")}${Array(25 - Math.floor((session.resource.playbackDuration / 1000 / track.duration) * 25)).fill("-").join("")}] ${toDuration(track.duration)}\``,
            inline: false
        }
    ]);
    else fields.push({
        name: "Played for:",
        value: '`' + toDuration(session.resource.playbackDuration / 1000) + '`',
        inline: true
    });

    interaction.reply({ embeds: [
        new Discord.EmbedBuilder()
        .setTitle(session.loopMode == "track" ? "🔂 Playing on loop" : "Now playing")
        .setFields(fields)
        .setColor(process.env.SUFFXCOLOR)
        .setThumbnail(track.youtubeThumbnail)
        .setDescription(track.live ? "ℹ️ *This content is live, therefore it will not stop playing until the livestream is over.*" : null)
    ]});
}