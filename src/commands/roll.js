const { ApplicationCommandOptionType } = require("discord.js");
const random = require("../utils/random");

module.exports = {
    name: "roll",
    description: "Rolls you a virtual dice!",
    options: [
        {
            name: "maxnumber",
            description: "The maximum value for the dice.",
            required: true,
            type: ApplicationCommandOptionType.Integer
        },
        {
            name: "minnumber",
            description: "The minimum value for the dice.",
            required: false,
            type: ApplicationCommandOptionType.Integer
        }
    ],
    permissionsRequired: [],

    callback: (client, interaction) => {
        let max = interaction.options.getInteger("maxnumber");
        let min = interaction.options.getInteger("minnumber") ?? 1;

        if(max < min) interaction.reply(`You supplied a minimum value larger than the maximum value.`);
        else if(max == min) interaction.reply(`You rolled a ${min}.`);
        else interaction.reply(`You rolled a ${random(min, max)}.`);


    }
}