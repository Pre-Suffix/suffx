const Discord = require("discord.js");
const errorEmbed = require("../utils/errorEmbed");
const sessionHandler = require("./utils/sessionHandler");
const random = require("../utils/random");

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

    if(session.queue.length < 2) {
        interaction.reply({ embeds: [ errorEmbed("Queue is too short, can't shuffle.") ] });
        return;
    } else if(session.skipping) {
        interaction.reply({ embeds: [ errorEmbed("Can't shuffle while changing tracks.") ] });
        return;
    }

    session.skipping = true;

    for(let i = 1; i < session.queue.length; ++i) {
        let randomIndex = random(1, session.queue.length - 1);
        let temp = session.queue[i];
        session.queue[i] = session.queue[randomIndex];
        session.queue[randomIndex] = temp;
    }

    session.skipping = false;

    interaction.reply({ embeds: [
        new Discord.EmbedBuilder()
        .setColor(process.env.SUFFXCOLOR)
        .setDescription("🔀 Shuffled upcoming tracks.")
    ]});
}