const { Client, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const memberModel = require("../../models/memberModel");

/**
 * 
 * @param { Client } client 
 * @param { ButtonInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!interaction.isButton()) return;
    if(!interaction.customId.startsWith("l_")) return;

    let interactionID = interaction.customId;
    let users = await memberModel.find({
        guildId: String(interaction.guild.id)
    });

    let pageCount = Math.ceil(users.length / 10);

    users.sort((a, b) => b.xp - a.xp);

    let page = +interactionID.split("_")[2] + (interactionID.startsWith("l_nextpage") ? 1 : -1);

    if(page == 0) page = Math.ceil(users.length / 10);
    if(page > Math.ceil(users.length / 10)) page = 1;

    users = users.slice((page - 1) * 10, page * 10);

    let description = [];

    users.forEach((x, i) => {
        description.push(`**${i + 1 + ((page - 1) * 10)}.** \`[ LEVEL ${Math.floor(Math.log2(x.xp / 1000)) + 1} • ${new Intl.NumberFormat('en-US').format(x.xp).replace(/,/g, " ")}xp ]\` <@${x.userId}>`);
    });

    let leaderboardEmbed = new EmbedBuilder()
    .setAuthor({
        name: `Leaderboard for ${interaction.guild.name} • Page ${page}/${pageCount}`,
        iconURL: interaction.guild.iconURL()
    })
    .setColor(process.env.SUFFXCOLOR)
    .setDescription(description.join("\n"));

    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId("l_lastpage_" + page)
        .setLabel("Previous page")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setCustomId("l_nextpage_" + page)
        .setLabel("Next page")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Primary)
    );

    interaction.update({
        embeds: [ leaderboardEmbed ],
        components: [ row ]
    });

}