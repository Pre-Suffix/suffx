const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");
const xpModel = require("../models/xpModel");

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
        let xps = await xpModel.find({
            guildId: String(interaction.guild.id)
        });
        let page = interaction.options.getInteger("page") ?? 1;

        if(xps) {

            if(page > Math.ceil(xps.length / 10)) page = Math.ceil(xps.length / 10);

            xps.sort((a, b) => b.xp - a.xp);
            
            let description = [];

            xps = xps.slice((page - 1) * 10, page * 10);

            xps.forEach((x, i) => {
                description.push(`**${i + 1 + ((page - 1) * 10)}.** \`[ LEVEL ${Math.floor(x.xp / 5000)} • ${new Intl.NumberFormat('en-US').format(x.xp).replace(/,/g, " ")}xp ]\` <@${x.userId}>`);
            });

            let leaderboardEmbed = new EmbedBuilder()
            .setAuthor({
                name: `Leaderboard for ${interaction.guild.name} • Page ${page}/${Math.ceil(xps.length / 10)}`,
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
                content: "There was a failiure retrieving this server's XPs."
            });
        }
    }
}