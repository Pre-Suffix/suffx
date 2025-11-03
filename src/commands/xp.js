const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const memberModel = require("../models/memberModel");

module.exports = {
    name: "xp",
    description: "Retrieves a user's XP.",
    options: [
        {
            name: "user",
            description: "What user to retrieve the XP from. If none supplied, defaults to you.",
            required: false,
            type: ApplicationCommandOptionType.User
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        let user = interaction.options.getUser("user") ?? interaction.user;

        let users = await memberModel.find({
            guildId: String(interaction.guild.id)
        });

        users.sort((a, b) => b.xp - a.xp);

        let xp = false;
        let pos = 0;

        users.forEach((x, i) => {
            if(x.userId == user.id) {
                xp = x;
                pos = i + 1;
            }
        });

        if(users && xp != false) {
            let xpEmbed = new EmbedBuilder()
            .setDescription(`### <@${user.id}>'s XP`)
            .setColor(process.env.SUFFXCOLOR)
            .setThumbnail(user.avatarURL({ size: 4096 }))
            .addFields([
                {
                    name: `#${new Intl.NumberFormat('en-US').format(pos).replace(/,/g, " ")} • Lvl ${Math.floor(Math.log2(xp.xp / 1000)) + 1} • ${new Intl.NumberFormat('en-US').format(xp.xp).replace(/,/g, " ")}xp`,
                    value: `\`[${new Array(Math.floor((xp.xp % 5000 / 5000) * 25)).fill("=").join("")}${new Array(25 - Math.floor((xp.xp % 5000 / 5000) * 25)).fill(" ").join("")}]\``
                }
            ]);

            interaction.reply({
                embeds: [
                    xpEmbed
                ]
            });
        } else {
            interaction.reply({
                content: "This user has no recorded XP."
            });
        }
    }
}