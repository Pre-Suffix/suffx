const Discord = require("discord.js");
const errorEmbed = require("../utils/errorEmbed");
const sessionHandler = require("./utils/sessionHandler");

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

    if((session.pastSongs.length + session.queue.length) < 1) {
        interaction.reply({ embeds: [ errorEmbed("Queue is empty.") ] });
        return;
    } else if (session.skipping) {
        interaction.reply({ embeds: [ errorEmbed("Cannot restart queue while skipping a track.") ] });
        return;
    }

    session.skipping = true;

    session.queue.unshift(...session.pastSongs);
    session.pastSongs = [];

    await session.play(0);

    session.skipping = false;

    interaction.reply({ embeds: [
        new Discord.EmbedBuilder()
        .setColor(process.env.SUFFXCOLOR)
        .setDescription("⏪ Restarted playback from beginning of the queue.")
    ]});
}