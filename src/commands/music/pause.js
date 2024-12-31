const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");
const toDuration = require("./utils/toDuration");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    let constructor = constructors.get(interaction.guild.id);

    if(constructor.player.state.status == "paused") {
        interaction.editReply({ embeds: [ errorEmbed("Music is already paused.", null) ] });
        return;
    }

    constructor.player.pause();

    interaction.editReply({ embeds: [ errorEmbed("Paused playback.", null, process.env.SUFFXCOLOR) ] });

}