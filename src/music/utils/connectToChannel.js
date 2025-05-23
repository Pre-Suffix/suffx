const DiscordVoice = require("@discordjs/voice");
const Discord = require("discord.js");

/**
 * 
 * @param { Discord.VoiceBasedChannel } channel 
 * @returns { DiscordVoice.VoiceConnection }
 */

module.exports = async (channel) => {
    const connection = DiscordVoice.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
    });

    try {
        await DiscordVoice.entersState(connection, DiscordVoice.VoiceConnectionStatus.Ready, 30_000);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}