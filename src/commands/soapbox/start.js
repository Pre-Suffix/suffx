const { Client, CommandInteraction, PermissionFlagsBits } = require("discord.js");
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

    let soapbox = await soapboxModel.findOne({
        guildId: interaction.guild.id
    });

    if(!soapbox) {
        interaction.reply("There is no soapbox instance initialized. Run /soapbox setup before running this command.");
        return;
    } else if(soapbox.userList.length < 1) {
        interaction.reply("Soapbox instance couldn't be initialized, there aren't any users registered.");
        return;
    } else if(!!soapbox.started) {
        interaction.reply("The soapbox instance has already been initialized.");
        return;
    }

    let userId = soapbox.steppedOn < 0 ? soapbox.soapboxUser : soapbox.userList[0];
    let user = null;

    while(!user && soapbox.userList.length > 0) {
        await interaction.guild.members.fetch(userId)
        .then((member) => {
            if(!member.roles.cache.has(soapbox.eligibilityRole)) {
                soapbox.userList.splice(soapbox.userList.indexOf(userId), 1);
                userId = soapbox.userList[0];
            } else user = member;
        })
        .catch((e) => {
            soapbox.userList.splice(soapbox.userList.indexOf(userId), 1);
            userId = soapbox.userList[0];
        });
    }

    if(!user) {
        interaction.reply("Soapbox session couldn't be initialized, there aren't any users registered.");
        return;
    }

    let channel = null;
    
    await interaction.guild.channels.fetch(soapbox.channelId)
    .then((ch) => channel = ch)
    .catch((e)=>{});

    if(!channel) {
        interaction.reply("Soapbox session couldn't be initialized, the channel in the settings is invalid.");
        return;
    }

    user.roles.add(soapbox.speakerRole).catch((e)=>{});

    let continuation = soapbox.soapboxUser == userId;

    if(!soapbox.alreadyTalked.includes(userId)) soapbox.alreadyTalked.push(userId);
    soapbox.soapboxUser = userId;
    soapbox.steppedOn = Math.round(Date.now() / 1000)
    - (continuation ? Math.abs(soapbox.steppedOn) : 0);
    soapbox.started = true;

    channel.send({
        content: `It's <@${userId}> turn on the Soapbox! Their round ends <t:${soapbox.steppedOn + soapbox.roundDuration}>.`
    });

    interaction.reply("Soapbox instance initialized.");

    await soapbox.save();
};