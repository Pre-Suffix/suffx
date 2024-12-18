const { EmbedBuilder } = require("discord.js");
const filter = require("../../utils/filter");

module.exports = (client, message) => {
    if(message.content.startsWith(".ai") && !message.author.bot) {
        try {
            if(message.content.split(" ").length == 1 || message.content.split(" ")[1] == "") {
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle("Invalid Syntax:")
                        .setDescription("Correct Syntax: `.ai <PROMPT>`")
                        .setColor("#ed4245")
                    ]
                });
            } else {
                import("../../utils/chatFunctions.mjs").then(async (chatFunctions) => {
                    await message.channel.sendTyping();

                    let prompt = message.content.split(" ").slice(1).join(" ");

                    let response = await chatFunctions.getCompletion(prompt);
        
                    if(response != false)
                        message.reply({
                            content: `Prompt: ${filter(prompt)}\n\`\`\`${response}\`\`\``
                        });
                    else
                        message.reply({
                            content: "There was an error processing your input. Try again later."
                        });

                    await message.channel.sendTyping();
                });

            }
        } catch (error) {
            console.log("ai.js: ", error);
        }
    }
}