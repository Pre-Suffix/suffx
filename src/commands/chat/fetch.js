const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonStyle } = require("discord.js");
const getMessages = require("../../utils/getMessages");
const chatModel = require("../../models/chatModel");
const filter = require("../../utils/filter");

module.exports = async (client, interaction) => {
    let chats = await chatModel.find({
        userId: interaction.user.id,
        active: false
    });

    if(!chats) {
        interaction.editReply({ content: "There was a problem retrieving your conversations.", ephemeral: true });
        return; 
    } 
    
    if(chats.length == 0) {
        interaction.editReply({ content: "You don't have any archived conversations.", ephemeral: true });
        return;
    }

    chats.sort((a, b) => a.ended - b.ended);

    let chatsDescriptions = [];
    let menuOptions = []

    chats.slice(-5).reverse().forEach((x, i) => {
        let messages = getMessages(x.uuid);
        let lastMessage = filter(messages.messages[messages.messages.length - 2].content);
        menuOptions.push(
            new StringSelectMenuOptionBuilder()
            .setLabel("Conversation " + String(i + 1))
            .setDescription(lastMessage.split("").slice(0, 50).join("") + (lastMessage.length >= 50 ? "..." : ""))
            .setValue("cc_" + x.uuid)
        );
        chatsDescriptions.push(`> **${i + 1}.** Dated <t:${x.ended}:f> (<t:${x.ended}:R>)\nLast message sent: \`${lastMessage}\``);
    });

    const row1 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId("cr_lastpage_1")
        .setLabel("Previous page")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setCustomId("cr_nextpage_1")
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

    interaction.editReply({
        content: `To retrieve a certain conversation, use the dropdown menu and select the number of the one you wish.\n\n__**Conversations:**__\n${chatsDescriptions.join("\n\n")}\n\nPage 1/${Math.ceil(chats.length / 5)}`,
        ephemeral: true,
        components: [ row1, row2 ]
    });
}