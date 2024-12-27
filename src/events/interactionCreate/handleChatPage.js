const { Client, ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const chatModel = require("../../models/chatModel");
const getMessages = require("../../utils/getMessages");
const filter = require("../../utils/filter");

/**
 * 
 * @param { Client } client 
 * @param { ButtonInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!interaction.isButton()) return;
    if(!interaction.customId.startsWith("cr_")) return;

    let interactionID = interaction.customId;
    let chats = await chatModel.find({
        userId: interaction.user.id,
        active: false
    });

    let pageCount = Math.ceil(chats.length / 5);

    chats.sort((a, b) => b.ended - a.ended);

    let page = +interactionID.split("_")[2] + (interactionID.startsWith("cr_nextpage") ? 1 : -1);

    if(page == 0) page = Math.ceil(chats.length / 5);
    if(page > Math.ceil(chats.length / 5)) page = 1;

    chats = chats.slice((page - 1) * 5, page * 5);

    let chatsDescriptions = [];
    let menuOptions = []

    chats.forEach((x, i) => {
        let messages = getMessages(x.uuid);
        let lastMessage = filter(messages.messages[messages.messages.length - 2].content);
        menuOptions.push(
            new StringSelectMenuOptionBuilder()
            .setLabel("Conversation " + String(i - 4 + (page * 5)))
            .setDescription(lastMessage.split("").slice(0, 50).join("") + (lastMessage.length >= 50 ? "..." : ""))
            .setValue("cc_" + x.uuid)
        );
        chatsDescriptions.push(`> **${i - 4 + (page * 5)}.** Dated <t:${x.ended}:f> (<t:${x.ended}:R>)\nLast message sent: \`${lastMessage}\``);
    });

    const row1 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId("cr_lastpage_" + page)
        .setLabel("Previous page")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setCustomId("cr_nextpage_" + page)
        .setLabel("Next page")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
        .setCustomId("cd_" + interaction.user.id)
        .setPlaceholder("Select a conversation!")
        .addOptions(menuOptions)
    );

    interaction.update({
        content: `To retrieve a certain conversation, use the dropdown menu and select the number of the one you wish.\n\n__**Conversations:**__\n${chatsDescriptions.join("\n\n")}\n\nPage ${page}/${pageCount}`,
        ephemeral: true,
        components: [ row1, row2 ]
    });

}