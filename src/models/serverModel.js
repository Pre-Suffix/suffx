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
    autoRoles: Array,
    serverName: String
});

module.exports = model("server", serverSchema);