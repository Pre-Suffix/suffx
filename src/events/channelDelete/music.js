const Discord = require("discord.js");
const sessionHandler = require("../../music/utils/sessionHandler");

/**
 * If the text/voice channel assigned to the music session is deleted, destroy the music session.
 * @param { Discord.NonThreadGuildBasedChannel } channel 
 */
module.exports = (channel) => {
    if(!sessionHandler.sessions.has(String(channel.guild?.id))) return;
    let session = sessionHandler.sessions.get(channel.guild.id.toString());

    if(session.textChannel.id == channel.id || session.voiceChannel.id == channel.id) session.destroy();
}