const sessionHandler = require("../../music/utils/sessionHandler");
const Discord = require("discord.js");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.VoiceState } oldState 
 * @param { Discord.VoiceState } newState 
 */
module.exports = (client, oldState, newState) => {
    // If bot was disconnected from VC with an active music session, destroy it.
    if(!!oldState.channel && !newState.channel && oldState.member.id == client.user.id && sessionHandler.sessions.has(oldState.guild.id)) {
        sessionHandler.sessions.get(oldState.guild.id).destroy();
    }

    // If bot was moved to another voice channel, change the music session's settings accordingly.
    // Also checks whether or not the bot can speak in the new voice channel.
    if(!!oldState.channel && !!newState.channel && oldState.member.id == client.user.id && sessionHandler.sessions.has(oldState.guild.id)) {
        let session = sessionHandler.sessions.get(oldState.guild.id);
        if(!oldState.channel.permissionsFor(oldState.member).has(Discord.PermissionFlagsBits.Speak))
            session.destroy();
        else
            session.voiceChannel = newState.channel;
    }
}