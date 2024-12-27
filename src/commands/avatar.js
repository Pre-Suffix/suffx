const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "avatar",
    description: "Retrieves a user's avatar.",
    options: [
        {
            name: "user",
            description: "User to retrieve avatar from. If none chosen, defaults to you.",
            required: false,
            type: ApplicationCommandOptionType.User
        }
    ],
    permissionsRequired: [],

    callback: (client, interaction) => {
        let user = interaction.options.getUser("user") ?? interaction.user;
        let mbr = interaction.guild.members.cache.find((member) => member.id == user.id);
        
        if(mbr.avatar)
            interaction.reply({
                content: "` Server Avatar   |   Global Avatar `",
                files: [
                    mbr.avatarURL({ size: 4096 }),
                    user.avatarURL({ size: 4096 })
                ]
            });
        else
            interaction.reply({
                content: user.avatarURL({ size: 4096 })
            });
    }
}