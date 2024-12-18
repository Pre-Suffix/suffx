const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const serverModel = require("../models/serverModel");


module.exports = {
    name: "autorole",
    description: "Manages the server's auto roles.",
    options: [
        {
            name: "add",
            description: "Adds a new role to the server's auto role.",
            options: [
                {
                    name: "role",
                    description: "Role to automatically give to new users",
                    required: true,
                    type: ApplicationCommandOptionType.Role
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "list",
            description: "Lists all the server's auto roles.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "remove",
            description: "Removes an auto role",
            options: [
                {
                    name: "role",
                    description: "Role to remove from the server's list",
                    required: true,
                    type: ApplicationCommandOptionType.Role
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [
        PermissionFlagsBits.ManageRoles
    ],

    callback: async (client, interaction) => {
        if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            interaction.reply({
                content: "You don't have enough permissions.",
                ephemeral: true
            });
            return;
        } 

        let server = await serverModel.findOne({
            guildId: interaction.guild.id
        });

        if(!server) {
            interaction.reply("There was a problem fetching server data.");
            return;
        }

        let subCommand = interaction.options.getSubcommand();

        if(subCommand === "add") {
            let roleId = String(interaction.options.getRole("role").id);

            if(interaction.guild.members.me.roles.highest.comparePositionTo(roleId) < 1) {
                interaction.reply({
                    content: "I cannot give this role out, as it is higher in the roles than my highest role.",
                    ephemeral: true
                });
            } else if(server.autoRoles.includes(roleId)) {
                interaction.reply({
                    content: "This role is already in this server's autorole list.",
                    ephemeral: true
                });
            } else {
                server.autoRoles.push(roleId);

                server.save()
                .then(() => {
                    interaction.reply({
                        content: `Role <@&${roleId}> has been added to the server's autorole list.`,
                        ephemeral: true
                    });
                })
                .catch((e) => {
                    interaction.reply("There was an error saving server data.");
                    console.log("autorole.js: ", e);
                });
            }
        } else if(subCommand === "list") {
            let roles = [];
            let invalidRoles = [];
            server.autoRoles.forEach((x) => {
                roles.push(`<@&${x}>`);
                if(interaction.guild.members.me.roles.highest.comparePositionTo(x) < 1) invalidRoles.push(`<@&${x}>`);
            });

            if(roles.length != 0) {
                let content = `This server currently has the following auto roles: ${roles.join(", ")}.`;
                if(invalidRoles.length != 0) content += `\n\n**WARNING:** The following roles are **higher than me**, as such I can't give them out: ${invalidRoles.join(", ")}.`;

                interaction.reply({
                    content,
                    ephemeral: true
                });
            } else {
                interaction.reply({
                    content: "This server has no auto roles.",
                    ephemeral: true
                });
            }
        } else if(subCommand === "remove") {
            let roleId = String(interaction.options.getRole("role").id);

            if(server.autoRoles.includes(roleId)) {
                let roles = [];
                server.autoRoles.forEach((x) => { if(x != roleId) roles.push(x); });

                server.autoRoles = roles;
                server.save()
                .then(() => {
                    interaction.reply({
                        content: `Role <@&${roleId}> successfully removed from the auto role list.`,
                        ephemeral: true
                    });
                })
                .catch((e) => {
                    interaction.reply("There was an error saving server data.");
                    console.log("autorole.js: ", e);
                });
            } else {
                interaction.reply({
                    content: "This role isn't in the auto role list.",
                    ephemeral: true
                });
            }
        }
    }
}