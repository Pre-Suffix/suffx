const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const timerModel = require("../models/timerModel");
const parseDuration = require('parse-duration');

module.exports = {
    name: "timer",
    description: "Reminds you of anything after a given time.",
    options: [
        {
            name: "set",
            description: "Sets you a new timer.",
            options: [
                {
                    name: "time",
                    description: "How long is the timer?",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },{
                    name: "reminder",
                    description: "What do you want to be reminded of?",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },{
                    name: "dm",
                    description: "Do you want to be reminded in a DM?",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        },{
            name: "list",
            description: "Lists all upcoming timers.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        let subCommand = interaction.options.getSubcommand();

        if(subCommand === "set") {
            let curTime = Math.floor(Date.now() / 1000);
            let setoffTS = parseDuration(interaction.options.getString("time"), "second");

            if(typeof setoffTS !== "number") {
                interaction.reply({
                    content: "Duration given is invalid. Try using only **H, M and S** in your time (ex. 12h34m56s).",
                    ephemeral: true
                });
                return;
            }

            setoffTS += curTime;

            let reminder = interaction.options.getString("reminder");
            let inDM = interaction.options.getBoolean("dm") ?? false;

            timerModel.create({
                guildId: String(interaction.guild.id),
                channelId: String(interaction.channel.id),
                userId: String(interaction.user.id),
                regTS: curTime,
                setoffTS,
                inDM,
                reminder,
                tries: 0
            })
            .catch((e) => {
                interaction.reply({
                    content: "There was an error creating your timer. Try later.",
                    ephemeral: true
                });
                console.log("timer.js: ", e);
            })
            .then(() => {
                interaction.reply({
                    content: `Your new timer will set off <t:${Math.round(setoffTS)}:R>. If the time is wrong, try using only **H, M and S** in your time (ex. 12h34m56s).`
                });
            });

        } else {
            let timers = await timerModel.find({
                userId: interaction.user.id
            });

            let timersEmbed = new EmbedBuilder()
            .setAuthor({
                name: "Your timers",
                iconURL: interaction.user.avatarURL()
            })
            .setColor(process.env.SUFFXCOLOR)
            .setDescription("You don't have any timers, or there was an error retrieving them.");

            if(timers && timers?.length > 0) { 
                timers.sort((a, b) => a.setoffTS - b.setoffTS);
                let timersDesc = [];

                timers.forEach((x) =>
                    timersDesc.push(`<t:${Math.round(x.setoffTS)}:R> • ${x.reminder ? "`" + x.reminder.replace(/`/g, "'") + "`" : "No reminder"}`)
                );

                timersEmbed.setDescription(timersDesc.join("\n"));
            }

            interaction.reply({
                embeds: [
                    timersEmbed
                ],
                ephemeral: true
            });
        }
    }
}