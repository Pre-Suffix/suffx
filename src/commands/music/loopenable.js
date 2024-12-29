const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    const vc = interaction.guild.members.me.voice.channel;

    if(vc && constructors.has(interaction.guild.id)) {

        let constructor = constructors.get(interaction.guild.id);

        constructor.onRepeat = true;

        constructors.update(interaction.guild.id, constructor);

        interaction.editReply({ embeds: [ errorEmbed("🔁 Looping has been enabled", null, process.env.SUFFXCOLOR) ] });
        
    } else {
        interaction.editReply({ embeds: [ errorEmbed("You need to run `/music join` before running this command.", "Invalid syntax") ] });
    }
}