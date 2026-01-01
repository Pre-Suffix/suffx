const Discord = require("discord.js");

/**
 * Handles button interactions on a Music Session's queue.
 * @param { Discord.Client } client 
 * @param { Discord.ButtonInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    if(!interaction.isButton()) return;

    const interactionID = interaction.customId.toString();
    if(!interactionID.startsWith("mc@") || !interactionID.endsWith("@answer")) return;

    const modal = new Discord.ModalBuilder()
    .setCustomId("mc@" + interactionID.split('@')[1] + "@modal")
    .setTitle("What's your answer?")
    .addLabelComponents(
        new Discord.LabelBuilder()
        .setLabel("Write below your answer.")
        .setDescription("The answer must be exactly the same number of letters as shown above. You have unlimited attempts.")
        .setId(13)
        .setTextInputComponent(
            new Discord.TextInputBuilder()
            .setCustomId("answer")
            .setMaxLength(25)
            .setStyle(Discord.TextInputStyle.Short)
            .setPlaceholder("Answer here!")
            .setRequired(true)
        )
    );

    interaction.showModal(modal);

}