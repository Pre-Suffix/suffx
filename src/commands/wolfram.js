const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const fetch = require("../utils/fetch");

module.exports = {
    name: "wolfram",
    description: "Uses WolframAlpha to quell your doubts.",
    options: [
        {
            name: "query",
            description: "What do you want to know?",
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        try {
            let query = interaction.options.getString("query");
        
            let result = await fetch.raw(`https://api.wolframalpha.com/v1/result?appid=${process.env.WOLFRAM_API}&input=${encodeURI(query).replace(/\+/g, "%2B")}`);
            let wolfram = new EmbedBuilder()
            .setAuthor({
                name: "WolframAlpha",
                iconURL: "https://i.imgur.com/9ir2qwT.png",
                url: `https://www.wolframalpha.com/input/?i=${encodeURI(query).replace(/\+/g, "%2B").replace(/\+/g, "%2B")})`
            })
            .setFooter({
                text: `Original query: ${query}`
            })
            .setColor("#EE3B25");

            if (result == "Wolfram|Alpha did not understand your input" || result == "No short answer available") {
                wolfram.setDescription(`## ${result}\n\nThis result is incomplete, [click here to go to Wolfram|Alpha and see the full result.](https://www.wolframalpha.com/input/?i=${encodeURI(query).replace(/\+/g, "%2B").replace(/\+/g, "%2B")})`);
            } else {
                wolfram.setDescription(`## [${result}](https://www.wolframalpha.com/input/?i=${encodeURI(query).replace(/\+/g, "%2B").replace(/\+/g, "%2B")})`);
            }

            interaction.editReply({embeds:[wolfram]});
        } catch (error) {
            console.log("wolfram.js: ", error);
            interaction.editReply({
                content: "There was an error while processing your request, please try again. If this is a reocurring issue, notify the bot's developer that this may be a bug."
            });
        }
        
    }
}