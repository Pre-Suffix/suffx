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

    let volume = interaction.options.getInteger("volume") ?? 100;

    session.volume = volume;
    if(!!session.resource) session.resource.volume.setVolume(volume / 100);

    let emoji = "🔊";

    if(volume == 0) emoji = "🔇";
    else if(volume <= 30) emoji = "🔈";
    else if(volume <= 90) emoji = "🔉";

    interaction.reply({ embeds: [ 
        new Discord.EmbedBuilder()
        .setColor(process.env.SUFFXCOLOR)
        .setDescription(`${emoji} Volume set to **${volume}%**`)
    ]});
    
}