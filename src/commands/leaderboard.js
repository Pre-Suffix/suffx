const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");
const memberModel = require("../models/memberModel");

module.exports = {
    name: "leaderboard",
    description: "Retrieves the server leaderboard.",
    options: [
        {
            name: "page",
            description: "Leaderboard page to retrieve.",
            minValue: 1,
            type: ApplicationCommandOptionType.Integer
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        let users = await memberModel.find({
            guildId: String(interaction.guild.id)
        });
        let page = interaction.options.getInteger("page") ?? 1;

        if(users) {

            let pageCount = Math.ceil(users.length / 10);

            if(page > pageCount) page = pageCount;

            users.sort((a, b) => b.xp - a.xp);
            
            let description = [];

            users = users.slice((page - 1) * 10, page * 10);

            users.forEach((x, i) => {
                description.push(`**${i + 1 + ((page - 1) * 10)}.** \`[ LEVEL ${Math.max(-1, Math.floor(Math.log(x.xp / 1000) / Math.log(1.1))) + 1} • ${new Intl.NumberFormat('en-US').format(x.xp).replace(/,/g, " ")}xp ]\` <@${x.userId}>`);
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

            interaction.reply({
                embeds: [ leaderboardEmbed ],
                components: [ row ]
            });
        } else {
            interaction.reply({
                content: "There was a failiure retrieving this server's users."
            });
        }
    }
}