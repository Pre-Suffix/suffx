const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "minutecryptic",
    description: "Front-end for the MinuteCryptic puzzle (MinuteCryptic.com)",
    options: [
        {
            name: "settimezone",
            description: "Changes the timezone for the puzzles.",
            options: [
                {
                    name: "timezone",
                    description: "Timezone as defined in TZ database (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)",
                    required: true,
                    maxLength: 100,
                    autocomplete: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "play",
            description: "Allows you to play the current MinuteCryptic puzzle, with clues you have unlocked.",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        const files = new Map([
            ["settimezone",  "setTimezone.js"],
            ["play",         "play.js"],
            ["answer",       "answer.js"]
        ]);

        let subCommand = interaction.options.getSubcommand();
        require("../minutecryptic/" + files.get(subCommand))(client, interaction);
    }
}