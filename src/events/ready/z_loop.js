const { Client, EmbedBuilder } = require("discord.js");
const Promise = require("bluebird");
const timerModel = require("../../models/timerModel");
const version = require("../../json/version.json");

/**
 * 
 * @param { Client } client 
 */

async function loop(client) {
    let allTimers = await timerModel.find({});
    let curTime = Math.floor(Date.now() / 1000);

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


    return Promise.delay(5000).then(() => loop(client));
}

module.exports = (client) => {
    loop(client);
    console.log(`(4/4) Started loop.\nSuffX v${version.version}b${version.build} is online.`)
}