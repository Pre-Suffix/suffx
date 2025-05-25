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

    if(session.skipping) {
        interaction.reply({ embeds: [ errorEmbed("You cannot run this command right now. Try again later.") ] });
        return;
    }

    await interaction.deferReply();
    let toTrack = interaction.options.getInteger("totrack") ?? 1;
    let originalLength = session.queue.length;

    session.skipping = true;
    session.player.stop();
    session.resource = null;

    if(session.loopMode == "track") {
        await session.play(0);

        session.skipping = false;

        interaction.editReply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setDescription("🔂 Restarted playback of current track (Track looping enabled).")
        ]});

        return;
    }

    for(let i = 1; (i <= toTrack) && (session.queue.length > 0); ++i) session.pastSongs.push(session.queue.shift());

    if(session.queue.length > 0) {
        await session.play(0);
    }

    session.skipping = false;

    interaction.editReply({ embeds: [
        new Discord.EmbedBuilder()
        .setColor(process.env.SUFFXCOLOR)
        .setDescription(toTrack == 1 ? "⏩ Skipped to the next track." : "⏩ Skipped " + Math.min(originalLength, toTrack) + " tracks.")
    ]});
    
}