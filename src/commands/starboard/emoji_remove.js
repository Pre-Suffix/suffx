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
    }

    let reactions = interaction.options.getInteger("reactions");

    if(server.starboard.emojis.find((x) => x.minStars == reactions) == undefined) {
        interaction.reply(`There is no emoji in the list with ${reactions} reactions.`);
        return;
    }

    let emojis = [];
    server.starboard.emojis.forEach((x) => { if(x.minStars != reactions) emojis.push(x); });
    server.starboard.emojis = emojis.sort((a, b) => a.minStars - b.minStars);

    emojis.forEach((x, i) => emojis[i] = `${x.emoji} @ ${x.minStars} reactions`);

    server.save()
    .then(() => interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setDescription("Starboard settings have been updated.")
            .addFields({
                name: "New emoji list:",
                value: emojis.length == 0 ? "None" : emojis.join("\n")
            })
        ]
    }))
    .catch((e) => {
        interaction.reply("There was an error saving server config.");
        console.log("config_stars.js: ", e);
    });    
}