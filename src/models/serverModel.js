const { Schema, model } = require('mongoose');
const serverSchema = new Schema({
    guildId: String,
    active: Boolean,
    logging: {
        active: Boolean,
        channelId: String,
        messageEdit: Boolean,
        messageDelete: Boolean
    },
    levelRoles: [
        {
            roleId: String, 
            level: Number
        }
    ],
    starboard: {
        active: Boolean,
        channelId: String,
        minStars: Number,
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
    guild: {
        name: String,
        iconURL: String
    },
    autoRoles: Array,
    keepRoles: Boolean,
});

module.exports = model("server", serverSchema);