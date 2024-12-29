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
    const vc = interaction.guild.members.me.voice.channel;

    if(vc && constructors.has(interaction.guild.id)) {

        let constructor = constructors.get(interaction.guild.id);

        if(constructor.player.state.status != "paused") {
            interaction.editReply({ embeds: [ errorEmbed("Music is already playing.", null) ] });
            return;
        }
        
        constructor.player.unpause();

        interaction.editReply({ embeds: [ errorEmbed("Resumed playback.", null, process.env.SUFFXCOLOR) ] });
        
    } else {
        interaction.editReply({ embeds: [ errorEmbed("You need to run `/music join` before running this command.", "Invalid syntax") ] });
    }
}