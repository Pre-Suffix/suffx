const chatModel = require("../../models/chatModel");

module.exports = async (client, interaction) => {
    let chat = await chatModel.findOne({
        userId: interaction.user.id,
        active: true
    });

    if(chat) {
        chat.active = false;
        chat.ended = Math.floor(Date.now() / 1000);

        chat.save()
        .catch(() => {
            interaction.editReply("There was an issue saving your conversation. Try again later.");
        })
        .then(() => {
            interaction.editReply("Your current conversation was saved. To retrieve it later, use the `/chat fetch` command.");
        });
    } else {
        interaction.editReply("You don't have an active conversation. To start one, use the `/chat send` command.");
    }
}