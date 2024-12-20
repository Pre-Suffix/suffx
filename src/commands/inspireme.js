const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const fetch = require("../utils/fetch");
const random = require("../utils/random");
const authors = require("../json/authors.json");

module.exports = {
    name: "inspireme",
    description: "Generates something truly inspiring, just for you. Powered by Inspirobot.me",
    options: [
        {
            name: "quote",
            description: "Gets you a truly inspiring quote.",
            type: ApplicationCommandOptionType.Subcommand
        },{
            name: "image",
            description: "Gets you a truly inspiring image.",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        let type = interaction.options.getSubcommand();

        if(type === "image") {
            await fetch.raw("https://inspirobot.me/api?generate=true")
            .then((img) => interaction.reply({
                content: img
            }));
        } else {
            await fetch.json("https://inspirobot.me/api?generateFlow=1&sessionID=")
            .then((flow) => {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`*${String(flow.data[random(0,2) * 2 + 1].text).replace(/\[pause\s[0-9]+]/ig, "")}*\n– ${authors[random(0, authors.length - 1)]}`)
                        .setColor(process.env.SUFFXCOLOR)
                    ]
                });
            });
        }
    }
}