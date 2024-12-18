const filter = require("../../utils/filter");

module.exports = (client, interaction) => {
    import("../../utils/chatFunctions.mjs").then(async (chatFunctions) => {
        let prompt = interaction.options.getString("prompt");

        let response = await chatFunctions.getCompletion(
            prompt, 
            interaction.options.getString("model") ?? "gpt-3.5-turbo-instruct", 
            interaction.options.getNumber("temperature") ?? 0.7
        );
    
        if(response != false)
            interaction.editReply({
                content: `Prompt: ${filter(prompt)}\n\`\`\`${response}\`\`\``
            });
        else
            interaction.editReply({
                content: "There was an error processing your input. Try again later."
            });
    });
}