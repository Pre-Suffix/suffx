const { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../../models/serverModel");
const getFields = require("./utils/getFields");
const getEmoji = require("./utils/getEmoji");

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
    }

    if(server.starboard?.active) {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setDescription("The starboard is already enabled. Here's the current settings:")
                .addFields(getFields(server.starboard))
                .setColor(process.env.SUFFXCOLOR)
            ]
        });
         
        return;
    }

    let channel = interaction.options.getChannel("channel");

    if(typeof channel.send != "function") {
        interaction.reply("You didn't supply a text channel.");
        return;
    }

    let minStars = interaction.options.getInteger("minstars") ?? 5;
    let reaction = interaction.options.getString("reaction") ?? "⭐";
    let visibilityRole = interaction.options.getRole("visibilityrole") ?? interaction.guild.roles.everyone;

    reaction = getEmoji(reaction);

    if(reaction == null) reaction = "⭐";
    else if(reaction.length == 19) {
        await interaction.guild.emojis.fetch(reaction)
        .then((emoji) => reaction = `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`)
        .catch(() => reaction = "⭐");
    }

    server.starboard.active = true;
    server.starboard.channelId = channel.id;
    server.starboard.minStars = minStars;
    server.starboard.visibilityRole = visibilityRole.id;
    server.starboard.reactionEmoji = {
        emoji: reaction,
        defaultEmoji: reaction.length < 10
    };
    server.starboard.emojis = [];

    server.save()
    .then(() => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setDescription("The starboard has been enabled with the following settings:")
                .addFields(getFields(server.starboard))
                .setColor(process.env.SUFFXCOLOR)
            ]
        });
    })
    .catch((e) => {
        interaction.reply("There was a problem saving server settings.");
        console.log("enable.js: ", e);
    })

}