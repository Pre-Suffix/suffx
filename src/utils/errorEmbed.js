const { EmbedBuilder } = require("discord.js");

/**
 * 
 * @param { String } description 
 * @param { String } title 
 * @returns { EmbedBuilder }
 */

module.exports = (description, title = "Error", color = "Red") => {
    return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);
}