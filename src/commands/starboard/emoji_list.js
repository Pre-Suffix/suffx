const { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../../models/serverModel");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        interaction.reply("You don't have enough permissions to run this command.");
        return;
    }

    let server = await serverModel.findOne({
        guildId: interaction.guild.id
    });

    if(!server) {
        interaction.reply("There was a problem retrieving server info.");
        return;
    } else if(!server.starboard.active) {
        interaction.reply("The starboard isn't active. Activate it before configuring it.");
        return;
    } else if(server.starboard.emojis.length == 0) {
        interaction.reply("There aren't any emojis in the list.");
        return;
    }

    let emojis = server.starboard.emojis.sort((a, b) => a.minStars - b.minStars);
    emojis.forEach((x, i) => emojis[i] = `${x.emoji} @ ${x.minStars} reactions`);

    interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setAuthor({
                name: `Starboard emoji list`
            })
            .setColor(process.env.SUFFXCOLOR)
            .setDescription(emojis.join("\n"))
        ]
    });

}