require("dotenv").config();
const Discord = require("discord.js");
const mongoose = require("mongoose");
const clientUtils = require("./utils/client");
const eventHandler = require("./handlers/eventHandler");
const apiHandler = require("./handlers/apiHandler");

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.DirectMessages,
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.GuildVoiceStates,
        Discord.IntentsBitField.Flags.MessageContent,
        Discord.IntentsBitField.Flags.GuildMessageReactions
    ],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
        Discord.Partials.GuildMember
    ]
});

async function main() {
    try {
        let MONGO_URI = process.env.MONGO_URI;
        let TOKEN = process.env.DISCORD_TOKEN;

        if(process.argv[2] == "--dev") {
            console.log("====RUNNING IN DEV MODE====")
            MONGO_URI = process.env.DEV_MONGO_URI;
            TOKEN = process.env.DISCORD_DEV_TOKEN;
        }

        await mongoose.connect(MONGO_URI);
        console.log("• Connected to database.");

        await client.login(TOKEN);

        clientUtils.set(client);

        eventHandler(client);
        apiHandler(MONGO_URI);

    } catch (err) {
        console.log(`index.js: ${err}`);
    }
    
}

main();