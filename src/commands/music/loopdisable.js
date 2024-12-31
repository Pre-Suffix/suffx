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

    constructor.onRepeat = false;

    constructors.update(interaction.guild.id, constructor);

    interaction.editReply({ embeds: [ errorEmbed("🔁 Looping has been disabled", null, process.env.SUFFXCOLOR) ] });
}