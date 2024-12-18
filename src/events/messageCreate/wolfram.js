const { EmbedBuilder } = require("discord.js");
const fetch = require("../../utils/fetch");

module.exports = async (client, message) => {
    if((message.content.startsWith(".wolfram") || message.content.startsWith(".jarvis")) && !message.author.bot) {
        try {
            let query = String(message.content).slice(9);
        
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

            message.reply({
                embeds: [
                    wolfram
                ]
            });
        } catch (error) {
            console.log("wolfram.js: ", error);
        }
    }
}