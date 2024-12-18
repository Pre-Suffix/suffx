const { EmbedBuilder } = require("discord.js");
const xpModel = require("../models/xpModel");

module.exports = {
    name: "leaderboard",
    description: "Retrieves the server leaderboard.",
    options: [],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        let xps = await xpModel.find({
            guildId: String(interaction.guild.id)
        });

        if(xps) {
            xps.sort((a, b) => b.xp - a.xp);
            xps = xps.slice(0, 10);
            
            let description = [];
            xps.forEach((x, i) => {
                description.push(`**${i + 1}.** \`[ LEVEL ${Math.floor(x.xp / 5000)} • ${new Intl.NumberFormat('en-US').format(x.xp).replace(/,/g, " ")}xp ]\` <@${x.userId}>`);
            });

            let leaderboardEmbed = new EmbedBuilder()
            .setAuthor({
                name: `Leaderboard for ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL()
            })
            .setColor(process.env.SUFFXCOLOR)
            .setDescription(description.join("\n"));

            interaction.reply({
                embeds: [
                    leaderboardEmbed
                ]
            });
        } else {
            interaction.reply({
                content: "There was a failiure retrieving this server's XPs."
            });
        }
    }
}