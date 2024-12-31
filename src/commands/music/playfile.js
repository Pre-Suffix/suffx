const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    const file = interaction.options.getAttachment("file");
    const isaudio = String(file.contentType).startsWith("audio");

    if(isaudio != true) {
        interaction.editReply({ embeds: [ errorEmbed("Provided file is not an audio file.", "Invalid file") ] });
        return;
    }

    const added = constructors.add(interaction.guild.id, file.url, file.name, String(interaction.user.id), file.duration);

    if(added) interaction.editReply({ embeds: [
        new Discord.EmbedBuilder()
        .setColor(process.env.SUFFXCOLOR)
        .setFields([
            {
                name: "Track queued:",
                value: `[\`${file.name}\`](${file.url})`,
                inline: true
            }, {
                name: "Requested by:",
                value: `<@${interaction.user.id}>`,
                inline: true
            }
        ])
    ]});
    else interaction.editReply({ embeds: [ errorEmbed("There was an issue adding your song to the queue.") ] });
}