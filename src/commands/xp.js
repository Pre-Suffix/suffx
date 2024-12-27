const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const xpModel = require("../models/xpModel");

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

        let xps = await xpModel.find({
            guildId: String(interaction.guild.id)
        });

        let xp = false;
        let pos = 0;

        xps.forEach((x, i) => {
            if(x.userId == user.id) {
                xp = x;
                pos = i + 1;
            }
        });

        if(xp) {
            let xpEmbed = new EmbedBuilder()
            .setDescription(`### <@${user.id}>'s XP`)
            .setColor(process.env.SUFFXCOLOR)
            .setThumbnail(user.avatarURL({ size: 4096 }))
            .addFields([
                {
                    name: `#${new Intl.NumberFormat('en-US').format(pos).replace(/,/g, " ")} • Lvl ${Math.floor(xp.xp / 5000)} • ${new Intl.NumberFormat('en-US').format(xp.xp).replace(/,/g, " ")}xp`,
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