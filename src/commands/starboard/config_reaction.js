const { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../../models/serverModel");
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
    } else if(!server.starboard.active) {
        interaction.reply("The starboard isn't active. Activate it before configuring it.");
        return;
    }

    const emoji = getEmoji(interaction.options.getString("emoji"));

    if(emoji == null) {
        interaction.reply("You didn't supply an emoji in your command.");
        return;
    } else if(emoji.length == 19) {
        await interaction.guild.emojis.fetch(emoji)
        .then((e) => {
            server.starboard.reactionEmoji.emoji = `<:${e.name}:${e.id}>`;
            server.starboard.reactionEmoji.defaultEmoji = false;

            server.save()
            .then(() => interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(process.env.SUFFXCOLOR)
                    .setDescription("Starboard settings have been updated.")
                    .addFields({
                        name: "New emoji:",
                        value: `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`
                    })
                ]
            }))
            .catch((e) => {
                interaction.reply("There was an error saving server config.");
                console.log("config_reaction.js: ", e);
            })
        })
        .catch(() => {
            interaction.reply("The emoji you supplied is from another server. Please, use another one.");
        });

    } else {
        server.starboard.reactionEmoji.emoji = emoji;
        server.starboard.reactionEmoji.defaultEmoji = true;

        server.save()
        .then(() => interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(process.env.SUFFXCOLOR)
                .setDescription("Starboard settings have been updated.")
                .addFields({
                    name: "New emoji:",
                    value: emoji
                })
            ]
        }))
        .catch((e) => {
            interaction.reply("There was an error saving server config.");
            console.log("config_reaction.js: ", e);
        });
    }
}