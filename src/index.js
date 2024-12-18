require("dotenv").config();
const Discord = require("discord.js");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.DirectMessages,
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent
    ],
    partials: [
        "MESSAGE",
        "CHANNEL",
        "REACTION"
    ]
});

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("(1/4) Connected to database.")

        client.login(process.env.TOKEN);

        eventHandler(client);
    } catch (err) {
        console.log(`index.js: ${err}`);
    }
    
}

main();