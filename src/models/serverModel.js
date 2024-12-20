const { Schema, model } = require('mongoose');
const serverSchema = new Schema({
    guildId : String,
    logChannel: String,
    levelRoles: [
        {
            roleId: String, 
            level: Number
        }
    ],
    starboard: {
        channelId: String,
        minStars: Number,
        active: Boolean,
        visibilityRole: String,
        reactionEmoji: {
            emoji: String,
            defaultEmoji: Boolean
        },
        emojis: [
            {
                emoji: String,
                minStars: Number
            }
        ]
    },
    autoRoles: Array,
    keepRoles: Boolean,
    serverName: String
});

module.exports = model("server", serverSchema);