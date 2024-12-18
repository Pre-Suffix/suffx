const { Schema, model } = require('mongoose');
const chatSchema = new Schema({
    userId: String,
    uuid: String,
    active: Boolean,
    ended: Number
});

module.exports = model("chat", chatSchema);