const { ApplicationCommandOptionType } = require("discord.js");
const path = require("path");

module.exports = {
    name: "starboard",
    description: "Manages the server's starboard.",
    options: [
        {
            name: "enable",
            description: "Enables the starboard.",
            options: [
                {
                    name: "channel",
                    description: "What channel to use as the starboard.",
                    required: true,
                    type: ApplicationCommandOptionType.Channel
                }, {
                    name: "minstars",
                    description: "How many reactions are required to get on the starboard.",
                    required: false,
                    min_value: 2,
                    max_value: 100,
                    type: ApplicationCommandOptionType.Integer
                }, {
                    name: "reaction",
                    description: "What Reaction will be used? (Input the emoji you want).",
                    required: false,
                    type: ApplicationCommandOptionType.String
                }, {
                    name: "visibilityrole",
                    description: "If this role can't see a channel, a message there won't go to starboard.",
                    required: false,
                    type: ApplicationCommandOptionType.Role
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "disable",
            description: "Disables the starboard.",
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "stats",
            description: "Displays stats for the server's starboard.",
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "random",
            description: "Retrieves a random starboarded message.",
            options: [
                {
                    name: "user",
                    description: "What user sent the message.",
                    required: false,
                    type: ApplicationCommandOptionType.User
                }, {
                    name: "channel",
                    description: "What channel the message was sent",
                    required: false,
                    type: ApplicationCommandOptionType.Channel
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "config",
            description: "Change the starboard's config",
            options: [
                {
                    name: "stars",
                    description: "Changes how many reactions are required to get on the starboard.",
                    options: [
                        {
                            name: "count",
                            description: "How many reactions are required to get on the starboard.",
                            required: true,
                            min_value: 2,
                            max_value: 100,
                            type: ApplicationCommandOptionType.Integer
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }, {
                    name: "reaction",
                    description: "Change the starboard's emoji.",
                    options: [
                        {
                            name: "emoji",
                            description: "What Emoji will be used? (Input the emoji you want).",
                            required: true,
                            type: ApplicationCommandOptionType.String
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }, {
                    name: "visibilityrole",
                    description: "Changes the visibility role (if this role can't see a channel, a message there can't be starboarded)",
                    options: [
                        {
                            name: "role",
                            description: "Role the bot will use to check if a message can be posted on starboard.",
                            required: true,
                            type: ApplicationCommandOptionType.Role
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }
            ],
            type: ApplicationCommandOptionType.SubcommandGroup
        }, {
            name: "emoji",
            description: "Manages the emojis to use in the starboard.",
            options: [
                {
                    name: "add",
                    description: "Adds a new emoji to the list.",
                    options: [
                        {
                            name: "emoji",
                            description: "What emoji will be used? (Input the emoji you want).",
                            required: true,
                            type: ApplicationCommandOptionType.String
                        }, {
                            name: "reactions",
                            description: "How many reactions for this emoji to be used?",
                            required: true,
                            min_value: 2,
                            max_value: 100,
                            type: ApplicationCommandOptionType.Integer
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }, {
                    name: "remove",
                    description: "Removes an emoji from the list.",
                    options: [
                        {
                            name: "reactions",
                            description: "The reaction count for the emoji you want to be removed.",
                            required: true,
                            min_value: 2,
                            max_value: 100,
                            type: ApplicationCommandOptionType.Integer
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }, {
                    name: "list",
                    description: "Lists all the emojis in the list.",
                    type: ApplicationCommandOptionType.Subcommand
                }
            ],
            type: ApplicationCommandOptionType.SubcommandGroup
        }
    ],
    permissionsRequired: [],

    callback: (client, interaction) => {
        require(path.join(
            __dirname, 
            "starboard", 
            (interaction.options.getSubcommandGroup() ?? "") + 
            (interaction.options.getSubcommandGroup() == null ? "" : "_") +
            interaction.options.getSubcommand()
        ))(client, interaction);
    }
}