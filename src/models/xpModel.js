const { Schema, model } = require('mongoose');
const xpSchema = new Schema({
    userId : String,
    xp: Number,
    guildId: String,
    rolesGiven: Array,
    leftWithRoles: Array
});

module.exports = model("xp", xpSchema);