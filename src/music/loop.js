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

    let loopMode = interaction.options.getString("mode");

    if(loopMode != "none" && loopMode != "track" && loopMode != "queue") loopMode = "none";

    session.loopMode = loopMode;

    if(loopMode == "none")
        interaction.reply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setDescription("🔁 Disabled looping.")
        ]});
    else
        interaction.reply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setDescription(`${loopMode == "track" ? "🔂" : "🔁"} Looping mode set to ${loopMode}.`)
        ]});
}