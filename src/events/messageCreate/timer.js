const { EmbedBuilder } = require("discord.js");
const timerModel = require("../../models/timerModel");
const parseDuration = require('parse-duration');

module.exports = async (client, message) => {
    if((message.content.startsWith(".timer") || message.content.startsWith(".reminder")) && !message.author.bot) {
        try {
            if(message.content.split(" ").length == 1 || message.content.split(" ")[1] == "") {
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle("Invalid Syntax:")
                        .setDescription(`Correct Syntax: \`${message.content.split(" ")[0]} <DURATION>\``)
                        .setColor("#ed4245")
                    ]
                });
            } else {
                let curTime = Math.floor(Date.now() / 1000);
                let setoffTS = parseDuration(message.content.split(" ").slice(1).join(" "), "second");

                if(typeof setoffTS !== "number") {
                    message.reply({
                        content: "Duration given is invalid. Try using only **H, M and S** in your time (ex. 12h34m56s)."
                    });
                    return;
                }

                setoffTS += curTime;

                timerModel.create({
                    guildId: String(message.guild.id),
                    channelId: String(message.channel.id),
                    userId: String(message.author.id),
                    regTS: curTime,
                    inDM: false,
                    reminder: null,
                    setoffTS,
                    tries: 0
                })
                .catch((e) => {
                    message.reply({
                        content: "There was an error creating your timer. Try later.",
                    });
                    console.log("timer.js: ", e);
                })
                .then(() => {
                    message.reply({
                        content: `Your new timer will set off <t:${setoffTS}:R>. If the time is wrong, try using only **H, M and S** in your time (ex. 12h34m56s).`
                    });
                });
            }
        } catch (error) {
            console.log("timer.js: ", error);
        }
    }
}