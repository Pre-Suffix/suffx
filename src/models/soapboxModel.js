const { Schema, model } = require("mongoose");
const soapboxSchema = new Schema({
    guildId: String,           // Server ID for this soapbox instance
    channelId: String,         // Soapbox channel ID

    userList: Array,           // Soapbox-eligible users
    alreadyTalked: Array,      // Users who have already been on the current soapbox session

    soapboxUser: String,       // User on the soapbox
    steppedOn: Number,         // Timestamp for when the current user stepped on the Soapbox
    roundDuration: Number,     // How long each soapbox round lasts in seconds

    eligibilityRole: String,   // Role used to determine whether or not a user can opt-in
    speakerRole: String,       // Role given to the soapbox speaker when they step on

    started: Boolean           // Whether or not the soapbox has been started or not
});

module.exports = model("soapbox", soapboxSchema);