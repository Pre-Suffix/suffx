const { EmbedBuilder } = require("discord.js");
const random = require("../../utils/random");

let filter = (num) => { return String(num).replace(/[^0-9]/g, ""); }

module.exports = async (client, message) => {
    if(message.content.startsWith(".roll") && !message.author.bot) {
        try {
            if(message.content.split(" ").length == 1 || filter(message.content.split(" ")[1]) == "") {
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle("Invalid Syntax:")
                        .setDescription("Correct Syntax: `.roll <MAX VALUE>`")
                        .setColor("#ed4245")
                    ]
                });
            } else {
                let max = filter(message.content.split(" ")[1]);
                max = max <= 1 ? 1 : max;


                message.reply({
                    content: `You rolled a ${random(1, max)}`
                });
            }
        } catch (error) {
            console.log("roll.js: ", error);
        }
    }
}