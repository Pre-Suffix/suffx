const Discord = require("discord.js");
const sessionHandler = require("../../music/utils/sessionHandler");

/**
 * If the text/voice channel assigned to the music session is changed so that the bot can't continue the session, destroy it.
 * @param { Discord.NonThreadGuildBasedChannel } oldChannel 
 * @param { Discord.NonThreadGuildBasedChannel } newChannel 
 */
module.exports = (oldChannel, newChannel) => {
    if(!sessionHandler.sessions.has(String(oldChannel.guild?.id))) return;
    let session = sessionHandler.sessions.get(oldChannel.guild.id.toString());

    if(
        (session.textChannel.id == oldChannel.id && !newChannel.permissionsFor(newChannel.guild.members.me).has(Discord.PermissionFlagsBits.SendMessages)) ||
        (session.voiceChannel.id == oldChannel.id && !newChannel.permissionsFor(newChannel.guild.members.me).has(Discord.PermissionFlagsBits.Speak))
    ) 
        session.destroy();
}