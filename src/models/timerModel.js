const { Schema, model } = require('mongoose');
const timerSchema = new Schema({
    guildId: String,
    channelId: String,
    reminder: String,
    setoffTS: Number,
    regTS: Number,
    userId: String,
    inDM: Boolean,
    tries: Number
})

module.exports = model("timer", timerSchema);