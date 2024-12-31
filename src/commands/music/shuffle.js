const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

module.exports = async (client, interaction) => {
    let constructor = constructors.get(interaction.guild.id);

    if(constructor.queue.length < 2) {
        interaction.editReply({ embeds: [ errorEmbed("You need at least two songs coming up next to shuffle.") ] });
        return;
    }

    let nowPlaying = constructor.queue.shift();

    constructor.queue = [ nowPlaying, ...shuffle(constructor.queue) ];

    constructors.update(interaction.guild.id, constructor);

    interaction.editReply({ embeds: [ errorEmbed("Successfully shuffled all upcoming tracks.", null, process.env.SUFFXCOLOR) ] });
}