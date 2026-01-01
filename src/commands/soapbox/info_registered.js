const { Client, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const soapboxModel = require("../../models/soapboxModel");

/**
 * 
 * @param { Client } client
 * @param { CommandInteraction } interaction
 */
module.exports = async (client, interaction) => {
    if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        interaction.reply("You don't have enough permissions to run this command.");
        return;
    }

    let soapbox = await soapboxModel.findOne({
        guildId: interaction.guild.id
    });

    if(!soapbox) {
        interaction.reply("There is no soapbox instance configured in this server.");
        return;
    } else if(soapbox.userList.length == 0) {
        interaction.reply("There are no users registered in this instance.");
        return;
    }

    let content = "**All registered users in the Soapbox:**\n\n";
    
    for(let i = 0; i < soapbox.userList.length; i++) {
        let item = ` - <@${soapbox.userList[i]}>`
        + (soapbox.alreadyTalked.includes(soapbox.userList[i]) ? " (already talked this session)\n" : '\n');

        if(content.length + item.length > 1940) {
            content += "The list has been cut-off due to the message size.";
            break;
        }

        content += item;
    }

    interaction.reply({
        content, flags: "Ephemeral"
    });

};