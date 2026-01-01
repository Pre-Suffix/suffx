const getPuzzle = require("./utils/getPuzzle");
const getResponse = require("./utils/getResponse");
const { Client, ChatInputCommandInteraction } = require("discord.js");

/**
 * 
 * @param { Client } client 
 * @param { ChatInputCommandInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    let puzzle = await getPuzzle(interaction.user.id);

    if(puzzle === false) {
        interaction.reply("There was a problem fetching your puzzle. Most likely, you haven't set up your timezone yet. To do so, run `/minutecryptic settimezone` before this command.");
        return;
    }

    if(puzzle === undefined) {
        interaction.reply("There was a problem fetching the puzzle. Try again later.");
        return;
    }
    
    const responseData = await getResponse(interaction.user.id);
    if(!responseData) {
        interaction.reply("Something went wrong while processing your request. Try again later.");
        return;
    }

    interaction.reply({
        embeds: [ responseData.responseEmbed ],
        components: responseData.components,
        flags: "Ephemeral"
    });

}