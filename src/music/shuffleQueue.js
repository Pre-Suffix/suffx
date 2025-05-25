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

    const shuffleType = interaction.options.getString("type");
    if((session.queue.length <= 2 && shuffleType == "upcoming") || ((session.queue.length + session.pastSongs.length) <= 2 && shuffleType == "queue")) {
        interaction.reply({ embeds: [ errorEmbed("Queue is too short, can't shuffle.") ] });
        return;
    } else if(session.skipping) {
        interaction.reply({ embeds: [ errorEmbed("Can't shuffle while changing tracks.") ] });
        return;
    }

    session.skipping = true;

    if(shuffleType == "upcoming") {
        for(let i = 1; i < session.queue.length; ++i) {
            let randomIndex = random(1, session.queue.length - 1);
            let temp = session.queue[i];
            session.queue[i] = session.queue[randomIndex];
            session.queue[randomIndex] = temp;
        }

        interaction.reply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setDescription("🔀 Shuffled upcoming tracks.")
        ]});

    } else {
        let newQueue = [ ...(session.queue ?? []), ...(session.pastSongs ?? []) ];
        newQueue.splice(0, 1);

        for(let i = 0; i < newQueue.length; ++i) {
            let randomIndex = random(0, newQueue.length - 1);
            let temp = newQueue[i];
            newQueue[i] = newQueue[randomIndex];
            newQueue[randomIndex] = temp;
        }

        session.queue = [ session.queue[0], ...newQueue ];
        session.pastSongs = [];

        interaction.reply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setDescription("🔀 Shuffled queue.")
        ]});
    }

    session.skipping = false;
}