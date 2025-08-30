const { Client, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const soapboxModel = require("../../models/soapboxModel");
const random = require("../../utils/random");

/**
 * 
 * @param { Client } client 
 * @param { CommandInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    let soapbox = await soapboxModel.findOne({
        guildId: interaction.guild.id
    });

    if(!soapbox) {
        interaction.reply("There is no soapbox instance configured in this server.");
        return;
    } else if(!soapbox.started) {
        interaction.reply("The soapbox instance is not active. Run /soapbox start before running this command.");
        return;
    } else if(!interaction.member.roles.cache.has(soapbox.eligibilityRole)) {
        interaction.reply("You don't have the required role to join the Soapbox.");
        return;
    } else if(soapbox.soapboxUser != interaction.user.id && 
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        interaction.reply("You can't skip this round, as you aren't the user in the Soapbox.");
        return;
    }

    let channel = null;
    await interaction.guild.channels.fetch(soapbox.channelId)
    .then((ch) => channel = ch)
    .catch((e)=>{});

    if(!channel) {
        interaction.reply("Couldn't process your request. The soapbox channel is invalid.");
        return;
    }

    if(Math.round(Date.now() / 1000) - soapbox.steppedOn <= 0.1 * soapbox.roundDuration)
        soapbox.alreadyTalked.splice(soapbox.alreadyTalked.indexOf(soapbox.soapboxUser), 1);
    
    let soapboxUser = null;
    await interaction.guild.members.fetch(soapbox.soapboxUser)
    .then((user) => soapboxUser = user)
    .catch((e)=>{});

    if(!!soapboxUser) await soapboxUser.roles.remove(soapbox.speakerRole).catch((e)=>{});

    let userList = [...soapbox.userList];
    soapbox.userList.forEach((v) => {
        if(soapbox.alreadyTalked.includes(v)) 
            userList.splice(userList.indexOf(v), 1);
    });

    let userId = userList[0];
    let user = null;

    while(!user && userList.length > 0) {
        await interaction.guild.members.fetch(userId)
        .then((member) => {
            if(!member.roles.cache.has(soapbox.eligibilityRole)) {
                userList.shift();
                userId = userList[0];
            } else user = member;
        })
        .catch((e) => {
            userList.shift();
            userId = userList[0];
        });
    }

    let restarted = !user;

    if(!user) {
        soapbox.alreadyTalked = [];
        
        for(let i = 1; i < soapbox.userList.length; i++) {
            let r = random(0, soapbox.userList.length - 1);
            if(r == i) r = 0;
            let t = soapbox.userList[i];
            soapbox.userList[i] = soapbox.userList[r];
            soapbox.userList[r] = t;
        }

        userId = soapbox.userList[0];

        while(!user && soapbox.userList.length > 0) {
            await interaction.guild.members.fetch(userId)
            .then((member) => {
                if(!member.roles.cache.has(soapbox.eligibilityRole)) {
                    soapbox.userList.shift();
                    userId = soapbox.userList[0];
                } else user = member;
            })
            .catch((e) => {
                soapbox.userList.shift();
                userId = soapbox.userList[0];
            });
        }

        if(!user || soapbox.userList.length == 0) {
            soapbox.steppedOn = 0;
            soapbox.userList = [];
            soapbox.soapboxUser = null;
            soapbox.started = false;

            await soapbox.save();

            channel.send("Soapbox has been stopped because there are no more eligible users.");

            interaction.reply("Your round has been skipped.");

            return;
        }

        restarted = true;
    }

    user.roles.add(soapbox.speakerRole).catch((e)=>{});

    if(!soapbox.alreadyTalked.includes(userId)) soapbox.alreadyTalked.push(userId);
    soapbox.soapboxUser = userId;
    soapbox.steppedOn = Math.round(Date.now() / 1000);

    if(restarted) {
        channel.send(`The last user has stepped off the soapbox, and with that we have reached the end of this session, and as such we're reshuffling all previous users! <@${userId}> has been picked this turn, their round ends on <t:${soapbox.steppedOn + soapbox.roundDuration}>.`);
    } else {
        channel.send(`The last user has stepped off the soapbox, as such it's time to pick another user to step up! <@${userId}>, it's your turn! Their round lasts until <t:${soapbox.steppedOn + soapbox.roundDuration}>.`);
    }

    interaction.reply("Your round has been skipped. "
        + ((Math.round(Date.now() / 1000) - soapbox.steppedOn > 0.1 * soapbox.roundDuration) ?
        "You'll only be eligible to return after all other users have gone." :
        "Since you spent less than 10% of your stay on the Soapbox, you're eligible to return at a later date.")
    );

    await soapbox.save();

};