const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */

async function main(client, interaction) {
    let serverInfo = new EmbedBuilder()
    .setAuthor({
        name: interaction.guild.name
    })
    .setThumbnail(interaction.guild.iconURL({ size: 4096 }))
    .setColor(process.env.SUFFXCOLOR)
    .addFields([
        {
            name: "ID", 
            value: interaction.guild.id, 
            inline: false
        }, {
            name: "Owner", 
            value: (!interaction.guild.ownerId ? "N/A" : `<@${interaction.guild.ownerId}>`), 
            inline: true
        }, {
            name: "Users", 
            value: String(interaction.guild.memberCount),
            inline: true
        }, {
            name: "Created", 
            value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:f>`, 
            inline: true
        }, {
            name: "Emojis",
            value: String(interaction.guild.emojis.cache.size),
            inline: true
        }, {
            name: "Stickers",
            value: String(interaction.guild.stickers.cache.size),
            inline: true
        }, {
            name: "Channels",
            value: String(interaction.guild.channels.cache.size),
            inline: true
        }
    ]);

    if(interaction.guild.banner != null) serverInfo.setImage(interaction.guild.bannerURL({ size: 4096 }));

    interaction.reply({
        embeds: [
            serverInfo
        ]
    });
}

module.exports = {
    name: "serverinfo",
    description: "Retrieves the server's general info.",
    options: [],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        main(client, interaction);
    }
}