const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    constructors.delete(interaction.guild.id);
    
    interaction.editReply({ embeds: [ errorEmbed("Leaving voice channel. If you wish to play a song again, start over with `/music join`", null, process.env.SUFFXCOLOR) ] });
}