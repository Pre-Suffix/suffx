const { Schema, model } = require('mongoose');
const userSchema = new Schema({
    userId: String,
    accessToken: String,
    refreshToken: String
});

module.exports = model("user", userSchema);