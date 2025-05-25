const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "music",
    description: "Manage the Music Player functionality of the bot.",
    options: [
        {
            name: "play",
            description: "Plays or adds track to queue.",
            options: [
                {
                    name: "query",
                    description: "Name/URL of track",
                    required: true,
                    maxLength: 100,
                    autocomplete: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "add",
            description: "Plays or adds track to queue.",
            options: [
                {
                    name: "query",
                    description: "Name/URL of track",
                    required: true,
                    maxLength: 100,
                    autocomplete: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "pause",
            description: "Pauses playback.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "resume",
            description: "Resumes playback.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "unpause",
            description: "Resumes playback.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "skip",
            description: "Skip current track.",
            options: [
                {
                    name: "totrack",
                    description: "What track to skip to. Check the queue for this info.",
                    required: false,
                    minValue: 1,
                    type: ApplicationCommandOptionType.Integer
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "volume",
            description: "Changes playback volume (0-200).",
            options: [
                {
                    name: "volume",
                    description: "Playback volume value (0-200).",
                    minValue: 0,
                    maxValue: 200,
                    required: true,
                    type: ApplicationCommandOptionType.Integer
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "queue",
            description: "Retrieves the current queue.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "nowplaying",
            description: "Retrieves information about currently playing track.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "shuffle",
            description: "Shuffles tracks.",
            options: [
                {
                    name: "type",
                    description: "What kind of shuffle do you want to do?",
                    choices: [
                        {
                            name: "Shuffle upcoming tracks",
                            value: "upcoming"
                        }, {
                            name: "Shuffle entire queue",
                            value: "queue"
                        }
                    ],
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "stats",
            description: "Retrieves statistics about current session.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "stop",
            description: "Stops playback, deletes queue and leaves voice channel.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "leave",
            description: "Stops playback, deletes queue and leaves voice channel.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "loop",
            description: "Selects loop mode.",
            options: [
                {
                    name: "mode",
                    description: "What looping mode will be used.",
                    choices: [
                        {
                            name: "None",
                            value: "none"
                        }, {
                            name: "Track",
                            value: "track"
                        }, {
                            name: "Queue",
                            value: "queue"
                        }
                    ],
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "restart",
            description: "Restarts the music session from the start of the queue.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak
    ],

    callback: async (client, interaction) => {
        const files = new Map([
            ["play",       "addTrack.js"],
            ["add",        "addTrack.js"],
            ["pause",      "pauseTrack.js"],
            ["resume",     "unpauseTrack.js"],
            ["unpause",    "unpauseTrack.js"],
            ["skip",       "skipTrack.js"],
            ["volume",     "changeVolume.js"],
            ["queue",      "getQueue.js"],
            ["nowplaying", "nowPlaying.js"],
            ["shuffle",    "shuffleQueue.js"],
            ["stats",      "sessionStats.js"],
            ["stop",       "destruct.js"],
            ["leave",      "destruct.js"],
            ["loop",       "loop.js"],
            ["restart",    "restart.js"]
        ]);

        let subCommand = interaction.options.getSubcommand();
        require("../music/" + files.get(subCommand))(client, interaction);

    }
}