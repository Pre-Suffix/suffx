const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "music",
    description: "Plays music on a voice channel.",
    options: [
        {
            name: "join",
            description: "Joins a voice channel and prepares to play music.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "play",
            description: "Plays a song, or adds it to the queue if one is already playing.",
            options: [
                {
                    name: "url",
                    description: "Adds a song to the queue from an URL",
                    options: [
                        {
                            name: "url",
                            description: "Plays audio from an URL, or adds it to the queue.",
                            required: true,
                            maxLength: 100,
                            type: ApplicationCommandOptionType.String
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }, {
                    name: "file",
                    description: "Plays a song from a file.",
                    options: [
                        {
                            name: "file",
                            description: "Plays an audio file, or adds it to the queue.",
                            required: true,
                            type: ApplicationCommandOptionType.Attachment
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }, {
                    name: "youtube",
                    description: "Adds or plays a song from a YouTube query to the queue.",
                    options: [
                        {
                            name: "query",
                            description: "What's the name of the video? (can be a direct link)",
                            required: true,
                            type: ApplicationCommandOptionType.String
                        }
                    ],
                    type: ApplicationCommandOptionType.Subcommand
                }
            ],
            type: ApplicationCommandOptionType.SubcommandGroup
        }, {
            name: "skip",
            description: "Skips current track and plays next up on the queue.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "setvolume",
            description: "Changes the volume the bot transmits at.",
            options: [
                {
                    name: "volume",
                    description: "The volume to change to, from 0-200 (100 being normal).",
                    minValue: 0,
                    maxValue: 200,
                    required: true,
                    type: ApplicationCommandOptionType.Integer
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "queue",
            description: "Gets the music queue for the server.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "leave",
            description: "Leaves the voice channel and deletes queue.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "nowplaying",
            description: "Gets the currently playing track.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "pause",
            description: "Pauses music playback.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "resume",
            description: "Resumes music playback.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "loop",
            description: "Manages whether the queue will loop or not.",
            options: [
                {
                    name: "enable",
                    description: "Enables queue looping.",
                    options: [],
                    type: ApplicationCommandOptionType.Subcommand
                },{
                    name: "disable",
                    description: "Disables queue looping.",
                    options: [],
                    type: ApplicationCommandOptionType.Subcommand
                }
            ],
            type: ApplicationCommandOptionType.SubcommandGroup
        }, {
            name: "stats",
            description: "Shows stats about the current music session.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "restart",
            description: "Stops currently playing song, and restarts the queue back from the start.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak
    ],

    callback: async (client, interaction) => {
        let subCommand = interaction.options.getSubcommand();
        let subCommandGroup = interaction.options.getSubcommandGroup();
        await interaction.deferReply();

        require(`./music/${subCommandGroup ?? ""}${subCommand}.js`)(client, interaction);
    }
}