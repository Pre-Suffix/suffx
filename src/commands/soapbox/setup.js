const { Client, CommandInteraction, PermissionFlagsBits, TextChannel } = require("discord.js");
const soapboxModel = require("../../models/soapboxModel");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        interaction.reply("You don't have enough permission to run this command.");
        return;
    } else if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        interaction.reply("To run this command, I need the MANAGE_ROLES permission.");
        return;
    } else if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        interaction.reply("To run this command, I need the MANAGE_CHANNELS permission.");
        return;
    }

    const reset       = interaction.options.getBoolean("reset", false) ?? false;
    const duration    = interaction.options.getInteger("duration", false) ?? 604800;
    const eligibility = interaction.options.getRole("eligibility", true);
    const channel = interaction.options.getChannel("channel", true);

    let soapbox = await soapboxModel.findOne({
        guildId: interaction.guild.id
    });

    if(!!soapbox && !reset) {
        interaction.reply("There is already a soapbox instance in this server. To reset the current one (deletes ALL USERS), run the command again with the 'reset' option set to true.");
        return;
    } else if(!!soapbox && !!reset) {
        await soapboxModel.findOneAndDelete({
            guildId: interaction.guild.id
        });
    }

    let speakerRole = await interaction.guild.roles.create({
        name: "Soapbox Speaker",
        reason: "SUFFX - Role for Soapbox speakers",
        mentionable: true
    });

    if(!speakerRole) return interaction.reply("Faliure while creating speaker role.");

    await channel.permissionOverwrites.create(speakerRole, {
        SendMessages: true,
        AttachFiles: true,
        EmbedLinks: true,
        SendPolls: true
    });

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
        AttachFiles: false,
        EmbedLinks: false,
        AddReactions: true,
        CreatePrivateThreads: false,
        CreatePublicThreads: false,
        ViewChannel: true,
        SendPolls: false,
        CreateEvents: false,
        ReadMessageHistory: true
    });

    await soapboxModel.create({
        guildId: interaction.guild.id,
        channelId: channel.id,
        userList: [],
        alreadyTalked: [],
        soapboxUser: null,
        steppedOn: 0,
        roundDuration: duration,
        eligibilityRole: eligibility.id,
        speakerRole: speakerRole.id,
        started: false
    });

    interaction.reply("Soapbox instance setup complete. To start the soapbox, run /soapbox start");
}