const crypticModel = require("../models/crypticModel");
const { Client, CommandInteraction } = require("discord.js");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    const timezone = interaction.options.getString("timezone");
    const user = await crypticModel.findOne({ userId: interaction.user.id.toString() });
    let success = false;

    if(!user) {
        success = !!(await crypticModel.create({
            userId: interaction.user.id.toString(),
            timezone: timezone
        }));
    } else {
        success = !!(await crypticModel.findOneAndUpdate(
            { userId: interaction.user.id.toString() },
            { timezone: timezone }
        ));
    }

    if(success) {
        interaction.reply(
            `Successfully changed timezone to \`${timezone}\`.`
        );
    } else {
        interaction.reply(
            "There was an error changing the timezone. Try again later."
        );
    }
    
}