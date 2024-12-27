const { Client, StringSelectMenuInteraction, AttachmentBuilder } = require("discord.js");
const getMessages = require("../../utils/getMessages");

/**
 * 
 * @param { Client } client 
 * @param { StringSelectMenuInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!interaction.isStringSelectMenu()) return;
    if(!interaction.customId.startsWith("cd_")) return;

    let uuid = interaction.values[0].split("_")[1];
    let messages = getMessages(uuid);

    if(!messages) {
        interaction.update({
            content: "Your conversation's archive wasn't found.",
            ephemeral: true,
            components: []
        });
        return;
    }

    let outputText = [];

    if(messages.instructions != "") outputText.push("Instructions: " + messages.instructions);

    messages.messages.forEach((x) => {
        outputText.push(`${x.role == "user" ? interaction.user.tag : "ChatGPT"}:\n${x.content}`);
    });

    outputText = outputText.join("\n\n");

    let textAttachment = new AttachmentBuilder()
    .setFile(Buffer.from(outputText))
    .setName(uuid + ".txt")
    .setDescription("ChatGPT chat log");

    interaction.update({
        content: "Here's the chatlog for your conversation:",
        ephemeral: true,
        components: [],
        files: [ textAttachment ]
    });

}