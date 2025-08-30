const { Client, EmbedBuilder, TextChannel, Guild, PermissionFlagsBits } = require("discord.js");
const timerModel = require("../../models/timerModel");
const soapboxModel = require("../../models/soapboxModel");
const random = require("../../utils/random");
const version = require("../../json/version.json");

/**
 * 
 * @param { Client } client 
 */

async function loop(client) {
    let allTimers = await timerModel.find({});
    let soapboxes = await soapboxModel.find({});
    let start = Date.now();
    let curTime = Math.floor(start / 1000);

    // Timer/reminder handler
    for(var i = 0; i < allTimers.length; ++i) {
        let timer = allTimers[i];
        if(timer.setoffTS > curTime) continue;

        if(timer.tries > 5) {
            await timerModel.findOneAndDelete(timer);
            continue;
        }

        let failed = false;
        let timerEmbed = new EmbedBuilder()
        .setTitle("Time's off!")
        .setDescription(`You set a timer <t:${timer.regTS}:R>.`)
        .setColor(process.env.SUFFXCOLOR);

        if(typeof timer.reminder == "string")
            timerEmbed.addFields([{
                name: "Reminder",
                value: timer.reminder
            }]);

        try {
            if(timer.inDM) {
                let user = await client.users.fetch(timer.userId);
    
                if(user)
                    await user.send({
                        embeds: [
                            timerEmbed
                        ]
                    }).then(async () => {
                        await timerModel.findOneAndDelete(timer);
                    });
                else failed = true;
            } else {
                let guild = await client.guilds.fetch(timer.guildId);

                if(guild) {
                    let channel = await guild.channels.fetch(timer.channelId);

                    if(channel)
                        await channel.send({
                            content: `<@${timer.userId}>`,
                            embeds: [
                                timerEmbed
                            ]
                        }).then(async () => {
                            await timerModel.findOneAndDelete(timer);
                        });
                    else failed = true;
                } else failed = true;
            }
        } catch (error) {
            timer.tries += 1;
            await timerModel.findOneAndUpdate({
                userId: timer.userId,
                regTS: timer.regTS,
                setoffTS: timer.setoffTS
            }, timer);

            console.log(`(try ${timer.tries}) z_loop.js: `, error);
        }
        
        if(failed) {
            timer.tries += 1;
            await timerModel.findOneAndUpdate({
                userId: timer.userId,
                regTS: timer.regTS,
                setoffTS: timer.setoffTS
            }, timer);
        }
    }

    // Soapbox handler
    for(let i = 0; i < soapboxes.length; i++) {
        let soapbox = soapboxes[i];
        if(!soapbox.started) continue;
        else if(Math.round(Date.now() / 1000) - soapbox.steppedOn <= soapbox.roundDuration) continue;

        /**
         * @type { Guild }
         */
        let guild = null;
        /**
         * @type { TextChannel }
         */
        let channel = null;

        await client.guilds.fetch(soapbox.guildId)
        .then((gd) => guild = gd)
        .catch((e)=>{ console.error("Error fetching guild. ", e); });

        if(!guild) {
            soapbox.started = false;
            soapbox.steppedOn = 0;
            
            await soapbox.save();
            continue;
        } else if(
            !guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles) ||
            !guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)
        ) {
            soapbox.started = false;
            soapbox.steppedOn = 0;
            
            await soapbox.save();
            continue;
        }

        await guild.channels.fetch(soapbox.channelId)
        .then((ch) => channel = ch)
        .catch((e)=>{ console.error("Error fetching channel. ", e); });
        
        if(!channel) {
            soapbox.started = false;
            soapbox.steppedOn = 0;

            await soapbox.save();
            continue;
        }

        let soapboxUser = null;
        await guild.members.fetch(soapbox.soapboxUser)
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
            await guild.members.fetch(userId)
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

        let restarted = false;

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
                await guild.members.fetch(userId)
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
    
                continue;
            }

            restarted = true;
        }

        user.roles.add(soapbox.speakerRole).catch((e)=>{});
        if(!soapbox.alreadyTalked.includes(userId)) soapbox.alreadyTalked.push(userId);
        soapbox.soapboxUser = userId;
        soapbox.steppedOn = Math.round(Date.now() / 1000);

        await soapbox.save();

        if(restarted) {
            channel.send(`We have reached the end of this session, and as such we're reshuffling all previous users! <@${userId}> has been picked this turn, their round ends on <t:${soapbox.steppedOn + soapbox.roundDuration}>.`);
        } else {
            channel.send(`End of round! As the last user steps off the Soapbox, <@${userId}> will now step up and speak this round, which lasts until <t:${soapbox.steppedOn + soapbox.roundDuration}>.`);
        }

    }

    let deltaT = Date.now() - start;
    let offset = process.env.LOOP_OFFSET - deltaT;

    setTimeout(() => loop(client), offset < 250 ? 250 : offset);
}

module.exports = (client) => {
    loop(client);
    console.log(`• Started loop.\nSuffX v${version.version}b${version.build} is online.`)
}