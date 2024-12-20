const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../models/serverModel");

module.exports = {
    name: "keeproles",
    description: "Manages rolekeeping (Auto-giving of roles upon re-entry of a user). [ADMIN ONLY]",
    options: [
        {
            name: "enable",
            description: "Enables rolekeeping.",
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "disable",
            description: "Disables rolekeeping.",
            type: ApplicationCommandOptionType.Subcommand
        }, 
    ],
    permissionsRequired: [
        PermissionFlagsBits.ManageRoles
    ],

    callback: async (client, interaction) => {
        if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            interaction.reply("You need administrator priviliges to run this command.");
            return;
        }

        let subCommand = interaction.options.getSubcommand();

        let server = await serverModel.findOne({
            guildId: interaction.guild.id
        });

        if(!server) {
            interaction.reply("There was a problem fetching server info.");
            return;
        }

        let content;

        if(subCommand === "enable") {
            server.keepRoles = true;
            content = "The bot will now keep track of the roles of anyone who leaves and, if they rejoin, will automatically re-give them the roles.";
        } else {
            server.keepRoles = false;
            content = "Rolekeeping has been disabled.";
        }

        server.save()
        .then(() => interaction.reply({
            content
        }))
        .catch((e) => {
            interaction.reply("There was a problem saving server info.");
            console.log("keeproles.js: ", e);
        });
        
    }
}