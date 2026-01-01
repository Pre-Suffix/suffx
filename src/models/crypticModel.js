const { Schema, model } = require('mongoose');
const crypticSchema = new Schema({
    userId : String,
    timezone: {
        type: String,
        default: "Europe/London"
    },
    puzzleDate: {
        type: String,
        default: "01-01-1970"
    },
    puzzleJSON: {
        type: String,
        default: "{}"
    }
});

module.exports = model("cryptic", crypticSchema);