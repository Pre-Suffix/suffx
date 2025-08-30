const { ApplicationCommandOptionType } = require("discord.js");
const path = require("path");

module.exports = {
    name: "soapbox",
    description: "Virtual soapbox, one user per time can speak in a channel.",
    options: [
        {
            name: "opt-in",
            description: "Opts you in to talk in the Soapbox.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "opt-out",
            description: "Opts you out from talking in the Soapbox.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "skip-round",
            description: "Skips the current soapbox round.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "setup",
            description: "(Admin only) Sets up the Soapbox for the first time, or resets it",
            options: [
                {
                    name: "channel",
                    description: "Channel the Soapbox will be in",
                    required: true,
                    type: ApplicationCommandOptionType.Channel
                }, {
                    name: "eligibility",
                    description: "Role used by the bot to check if a user can join the Soapbox",
                    required: true,
                    type: ApplicationCommandOptionType.Role
                }, {
                    name: "duration",
                    description: "How long each soapbox round lasts in seconds (Default: 1 week)",
                    min_value: 60,
                    type: ApplicationCommandOptionType.Integer
                }, {
                    name: "reset",
                    description: "To reset an already existing soapbox instance, toggle this",
                    type: ApplicationCommandOptionType.Boolean
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "start",
            description: "(Admin only) Starts the soapbox instance in the server.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "stop",
            description: "(Admin only) Stops the soapbox instance in the server.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "config",
            description: "(Admin only) Changes soapbox settings",
            options: [
                {
                    name: "duration",
                    description: "Change how long, in seconds, each soapbox round lasts",
                    options: [
                        {
                            name: "seconds",
                            description: "Duration in seconds",
                            required: true,
                            min_value: 60,
                            type: ApplicationCommandOptionType.Integer
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }, {
                    name: "eligibility",
                    description: "Change the role used by the bot to check if a user can join the Soapbox",
                    options: [
                        {
                            name: "role",
                            description: "Role",
                            required: true,
                            type: ApplicationCommandOptionType.Role
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }
            ],
            type: ApplicationCommandOptionType.SubcommandGroup
        }, {
            name: "info",
            description: "(Admin only) Information about the soapbox instance.",
            options: [
                {
                    name: "registered",
                    description: "Reports all registered users, including if they've talked in this session or not.",
                    options: [],
                    type: ApplicationCommandOptionType.Subcommand
                }, {
                    name: "settings",
                    description: "Shows all current settings of the soapbox instance.",
                    options: [],
                    type: ApplicationCommandOptionType.Subcommand
                }
            ],
            type: ApplicationCommandOptionType.SubcommandGroup
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        require(path.join(
            __dirname, 
            "soapbox", 
            (interaction.options.getSubcommandGroup() ?? "") + 
            (interaction.options.getSubcommandGroup() == null ? "" : "_") +
            interaction.options.getSubcommand()
        ))(client, interaction);
    }
}