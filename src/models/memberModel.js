const { Schema, model } = require('mongoose');
const memberSchema = new Schema({
    userId : String,
    guildId: String,
    admin: Boolean,
    xp: Number,
    rolesGiven: Array,
    leftWithRoles: Array
});

module.exports = model("member", memberSchema);