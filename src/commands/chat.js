const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "chat",
    description: "This command has been disabled.",
    options: [],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        //  This system has been removed because I am tired of paying money to OpenAI.
        //  At some point, I may substitute it for some other AI system, one that is
        //  actually open. Until then however, if you run an instance of my bot and want
        //  to continue using this, run an older version. I can't be bothered to fix it
        //  (since it has been broken since GPT-5 got released).
        //  
        //  If you're reading this, I hope you have a good day, and please don't contact
        //  me about this.

        interaction.reply({
            content: "This command has been disabled."
        })
    }
}