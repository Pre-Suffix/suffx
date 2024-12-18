const { EmbedBuilder } = require("discord.js");
const chatModel = require("../../models/chatModel");
const getMessages = require("../../utils/getMessages");
const saveMessages = require("../../utils/saveMessages");
const filter = require("../../utils/filter");
const getUUID = require("../../utils/getUUID");

module.exports = (client, interaction) => {

    import("../../utils/chatFunctions.mjs").then(async (chatFunctions) => {
        let prompt = interaction.options.getString("prompt");
        let model = interaction.options.getString("model") ?? "gpt-4o-mini";
        let instructions = interaction.options.getString("instructions") ?? "";

        let chat = await chatModel.findOne({
            userId: interaction.user.id,
            active: true
        });

        if(!chat) {
            chat = {
                userId: interaction.user.id,
                active: true,
                uuid: getUUID(),
                ended: 0
            };
            chatModel.create(chat);
        }

        let messages = getMessages(chat.uuid) ?? {
            messages: [],
            instructions,
            created: Math.floor(Date.now() / 1000),
            lastUpdated: 0,
            userId: String(interaction.user.id)
        };

        if(instructions != "") messages.instructions = instructions;
        messages.lastUpdated = Math.floor(Date.now() / 1000);

        let response = await chatFunctions.getChatResponse(
            prompt,
            model,
            messages.instructions,
            messages.messages
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

        messages.messages.push(
            {
                role: "user",
                content: prompt
            },
            response
        );

        saveMessages(messages, chat.uuid);
    });
}