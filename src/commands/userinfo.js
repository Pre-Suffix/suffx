const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "userinfo",
    description: "Retrieves the info about a user.",
    options: [
        {
            name: "user",
            description: "User to retrieve info from. If none chosen, defaults to you.",
            required: false,
            type: ApplicationCommandOptionType.User
        }
    ],
    permissionsRequired: [],

    callback: (client, interaction) => {
        let user = interaction.options.getUser("user") ?? interaction.user;
        let mbr = interaction.guild.members.cache.find((member) => member.id == user.id);
        
        let userInfo = new EmbedBuilder()
        .setAuthor({name: user.tag})
        .setThumbnail(mbr.avatar ? mbr.avatarURL({format: "png", size: 4096}) : user.avatarURL({format: "png", size: 4096}))
        .addFields([
          {
            name: "Member Info:",
            value: `\`\`\`markdown\nNickname:   ${mbr.nickname !== null ? mbr.nickname : user.username}\nJoined:     ${mbr.joinedAt.toDateString()}\n\`\`\``
          }, {
            name: "User Info:",
            value: `\`\`\`markdown\nID:         ${user.id}\nTag:        ${user.discriminator == 0 ? "@" : ""}${user.username}${user.discriminator == 0 ? "" : `#${user.discriminator}`}\nCreated at: ${user.createdAt.toDateString()}\n\`\`\``
          }
        ])
        .setColor(process.env.SUFFXCOLOR);
        
        if(mbr.avatar) {
          userInfo.addFields([
            {
              name: "Avatars:",
              value: `**[Server avatar](${mbr.avatarURL({format: "png", size: 4096})})**\n**[User avatar](${user.avatarURL({format: "png", size: 4096})})**`
            }
          ]);
        } else {
          userInfo.addFields([
            {
              name: "Avatar:",
              value: `**[User avatar](${user.avatarURL({format: "png", size: 4096})})**`
            }
          ]);
        }

        interaction.reply({
            embeds: [
                userInfo
            ]
        });
    }
}