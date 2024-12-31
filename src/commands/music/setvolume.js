const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    let constructor = constructors.get(interaction.guild.id);
    
    constructor.volume = interaction.options.getInteger("volume");
    if(constructor.resource) constructor.resource.volume.setVolume(constructor.volume / 100);

    constructors.update(interaction.guild.id, constructor);

    interaction.editReply({ embeds: [ errorEmbed("Volume changed to `" + constructor.volume + '`', null, process.env.SUFFXCOLOR) ] });
}