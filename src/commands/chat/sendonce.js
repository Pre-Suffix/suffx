const { EmbedBuilder } = require("discord.js");
const filter = require("../../utils/filter");
const splitText = require("../../utils/splitText");

module.exports = (client, interaction) => {
    
    import("../../utils/chatFunctions.mjs").then(async (chatFunctions) => {
        let prompt = interaction.options.getString("prompt");
    
        let response = await chatFunctions.getChatResponse(
            prompt,
            interaction.options.getString("model") ?? "gpt-4o-mini",
            interaction.options.getString("instructions") ?? ""
        );
    
        if(!response) {
            interaction.editReply("There was an error processing your input. Try again later");
            return;
        }
    
        let userEmbed = new EmbedBuilder()
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL()
        })
        .setDescription(filter(prompt))
        .setColor(process.env.SUFFXCOLOR);
    
        let botEmbeds = [];
        
        if(response.content.length <= 4096) 
            botEmbeds.push(
                new EmbedBuilder()
                .setAuthor({
                    name: "ChatGPT",
                    iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png"
                })
                .setDescription(response.content)
                .setColor("#10a37f")
            );
        else {
            let text = splitText(response.content, 3800);
            text.forEach((x, i) => {
                let embed = new EmbedBuilder()
                .setDescription(x)
                .setColor("#10a37f")
                .setFooter({
                    text: `Part ${i + 1}/${text.length}`
                });
                
                if(i == 0) embed.setAuthor({
                    name: "ChatGPT",
                    iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png"
                });

                botEmbeds.push(embed);
            });
        }

        let reply = await interaction.editReply({
            embeds: [
                userEmbed,
                botEmbeds.shift()
            ]
        });

        botEmbeds.forEach((embed) =>
            reply.reply({
                embeds: [ embed ]
            })
        );
        
    });
} 