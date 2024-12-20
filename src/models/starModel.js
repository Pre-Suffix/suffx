const { Schema, model } = require('mongoose');
const starSchema = new Schema({
    guildId : String,
    channelId: String,
    message: {
        messageId: String,
        userId: String,
    },
    replyingTo: {
        messageId: String,
        userId: String
    },
    starboardMessageId: String,
    stars: Number
});

module.exports = model("star", starSchema);