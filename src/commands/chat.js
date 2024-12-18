const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "chat",
    description: "ChatGPT-based chat command.",
    options: [
        {
            name: "completion",
            description: "Old-style GPT, simply completes your input.",
            options: [
                {
                    name: "prompt",
                    description: "Your prompt.",
                    required: true,
                    maxLength: 50,
                    type: ApplicationCommandOptionType.String
                }, {
                    name: "model",
                    description: "The GPT model being used.",
                    required: false,
                    choices: [
                        { name: 'GPT 3.5 (most advanced)', value: 'gpt-3.5-turbo-instruct' },
                        { name: 'Davinci (middle-ground)', value: 'davinci-002' },
                        { name: 'Babbage (most basic)',    value: 'babbage-002' }
                    ],
                    type: ApplicationCommandOptionType.String
                }, {
                    name: "temperature",
                    description: "How random, from 0 to 1, the result is. Use decimals",
                    required: false,
                    type: ApplicationCommandOptionType.Number,
                    min_value: 0.0,
                    max_value: 1.0
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "sendonce",
            description: "Uses ChatGPT, but without maintaining a conversation.",
            options: [
                {
                    name: "prompt",
                    description: "Your prompt.",
                    required: true,
                    maxLength: 512,
                    type: ApplicationCommandOptionType.String
                }, {
                    name: "model",
                    description: "The ChatGPT model to be used.",
                    required: false,
                    choices: [
                        { name: "GPT-4o (most advanced)", value: "gpt-4o" },
                        { name: "GPT-4o mini (recommended)", value: "gpt-4o-mini" },
                        { name: "GPT-3.5 (less advanced)", value: "gpt-3.5-turbo" }
                    ],
                    type: ApplicationCommandOptionType.String
                }, {
                    name: "instructions",
                    description: "Instructions on how the AI should act.",
                    required: false,
                    maxLength: 512,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "send",
            description: "Sends a message in your active conversation, or starts a new one.",
            options: [
                {
                    name: "prompt",
                    description: "Your prompt.",
                    required: true,
                    maxLength: 512,
                    type: ApplicationCommandOptionType.String
                }, {
                    name: "model",
                    description: "The ChatGPT model to be used.",
                    required: false,
                    choices: [
                        { name: "GPT-4o (most advanced)", value: "gpt-4o" },
                        { name: "GPT-4o mini (recommended)", value: "gpt-4o-mini" },
                        { name: "GPT-3.5 (less advanced)", value: "gpt-3.5-turbo" }
                    ],
                    type: ApplicationCommandOptionType.String
                }, {
                    name: "instructions",
                    description: "Instructions on how the AI should act.",
                    required: false,
                    maxLength: 512,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "end",
            description: "Ends the active conversation.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "fetch",
            description: "Retrieves you a saved conversation.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        let subCommand = interaction.options.getSubcommand();
        let ephemeralSubCommands = [ "fetch" ];
        await interaction.deferReply({ ephemeral: ephemeralSubCommands.includes(subCommand) });

        require(`./chat/${subCommand}.js`)(client, interaction);
    }
}