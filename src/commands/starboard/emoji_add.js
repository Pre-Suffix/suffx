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

    let emoji = getEmoji(interaction.options.getString("emoji"));
    let stars = interaction.options.getInteger("reactions");

    if(server.starboard.emojis.find((v) => v.minStars == stars) != undefined) {
        interaction.reply(`There is already an emoji configured at ${stars} reactions. Delete it with \`/starboard emoji remove reactions:${stars}\` before adding a new one.`);
    } else if(emoji == null) {
        interaction.reply("You didn't supply an emoji in your command.");
    } else if(emoji.length > 10) {
        interaction.guild.emojis.fetch(emoji)
        .then((e) => {
            server.starboard.emojis.push({
                emoji: `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`,
                minStars: stars
            });

            server.save()
            .then(() => interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(process.env.SUFFXCOLOR)
                    .setDescription("Starboard settings have been updated.")
                    .addFields({
                        name: "New emoji:",
                        value: `<${e.animated ? "a" : ""}:${e.name}:${e.id}> @ ${stars} reactions`
                    })
                ]
            }))
            .catch((e) => {
                interaction.reply("There was an error saving server config.");
                console.log("emoji_add.js: ", e);
            });
        })
        .catch(() => {
            interaction.reply("The emoji you supplied is from another server. Please, use another one.");
        });
    } else {
        server.starboard.emojis.push({
            emoji: `${emoji}`,
            minStars: stars
        });
        server.starboard.emojis.sort((a, b) => a.minStars - b.minStars);

        server.save()
        .then(() => interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(process.env.SUFFXCOLOR)
                .setDescription("Starboard settings have been updated.")
                .addFields({
                    name: "New emoji:",
                    value: `${emoji} @ ${stars} reactions`
                })
            ]
        }))
        .catch((e) => {
            interaction.reply("There was an error saving server config.");
            console.log("emoji_add.js: ", e);
        });
    }
}