const { Schema, model } = require('mongoose');
const crypticPastSchema = new Schema({
    userId : String,
    puzzleId: String,
    solved: {
        type: Boolean,
        default: false
    },
    par: {
        type: Number,
        default: -1
    },
    revealedFodder: {
        type: Boolean,
        default: true
    },
    revealedDefinition: {
        type: Boolean,
        default: true
    },
    revealedIndicators: {
        type: Boolean,
        default: true
    },
    revealedLetters: {
        type: Number,
        default: 0
    },
    letterRevealOrder: {
        type: Array,
        default: [0]
    },
    answer: {
        type: String,
        default: "if you're seeing this, something broke"
    }
});

module.exports = model("crypticpast", crypticPastSchema);