const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const serverModel = require("../models/serverModel");

module.exports = {
    name: "levelrole",
    description: "Manages the server's Level Roles. [ADMIN ONLY]",
    options: [
        {
            name: "add",
            description: "Adds a new level role",
            options: [
                {
                    name: "level",
                    description: "What level a user needs to get this role.",
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    required: true
                }, {
                    name: "role",
                    description: "What role to give out.",
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "remove",
            description: "Removes a level role.",
            options: [
                {
                    name: "role",
                    description: "The role associated with the level role you want to remove.",
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: "list",
            description: "Lists all level roles.",
            options: [],
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissionsRequired: [
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ModerateMembers
    ],

    callback: async (client, interaction) => {
        if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            interaction.reply({
                content: "You need the `ADMINISTRATOR` permission to run this command.",
                ephemeral: true
            });
            return;
        }

        let subCommand = interaction.options.getSubcommand();
        let server = await serverModel.findOne({
            guildId: String(interaction.guild.id)
        });

        if(!server) {
            interaction.reply({
                content: "There was a failiure retrieving the server's info.",
                ephemeral: true
            });
            return;
        }

        if(subCommand === "add") {
            const level = interaction.options.getInteger("level");
            const role = interaction.options.getRole("role");
            let roleIndex = server.levelRoles.findIndex((v) => v.roleId == role.id);

            if(roleIndex !== -1) {
                server.levelRoles[roleIndex].level = level;
                
                await server.save().catch((e) => console.log("levelrole.js: ", e));

                interaction.reply({
                    content: `Level role edited: <@&${role.id}> changed to level ${level}`,
                    ephemeral: true
                });
            } else {
                server.levelRoles.push({
                    level,
                    roleId: String(role.id)
                });

                await server.save().catch((e) => console.log("levelrole.js: ", e));

                interaction.reply({
                    content: `Created level role: <@&${role.id}> at level ${level}.`,
                    ephemeral: true
                });
            }
        } else if(subCommand === "remove") {
            const role = interaction.options.getRole("role");
            let roleIndex = server.levelRoles.findIndex((v) => v.roleId == role.id);

            if(roleIndex !== -1) {
                let dlr = server.levelRoles[roleIndex];
                let lr = [];
                server.levelRoles.forEach((v, i) => { if(i != roleIndex) lr.push(v); });

                server.levelRoles = lr;

                await server.save().catch((e) => console.log("levelrole.js: ", e));

                interaction.reply({
                    content: `Deleted level role: <@&${dlr.roleId}> at level ${dlr.level}`,
                    ephemeral: true
                });
            } else {
                interaction.reply({
                    content: `No level role exists for <@&${role.id}>. Use \`/levelrole list\` to list all active level roles.`,
                    ephemeral: true
                });
            }
        } else {
            let levelRoles = [];
            server.levelRoles.forEach((x) => {
                levelRoles.push(`- <@&${x.roleId}> at level ${x.level}`);
            });

            let levelRolesEmbed = new EmbedBuilder()
            .setAuthor({
                name: "Level roles for " + interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            })
            .setColor(process.env.SUFFXCOLOR)
            .setDescription(levelRoles.length == 0 ? "This server has no level roles." : levelRoles.join("\n"));

            interaction.reply({
                embeds: [
                    levelRolesEmbed
                ],
                ephemeral: true
            });
        }

    }
}