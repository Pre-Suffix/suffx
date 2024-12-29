const { Client, Message } = require("discord.js");
const random = require("../../utils/random");
const xpModel = require("../../models/xpModel");
const serverModel = require("../../models/serverModel");
let sentRecently = new Set();

/**
 * 
 * @param { Client } client 
 * @param { Message } message 
 */

module.exports = async (client, message) => {
    if(!message.inGuild() || message.author.bot || sentRecently.has(message.author.id)) return;

    let dayOfTheWeek = Math.floor(Date.now() / 86400000) % 7;
    dayOfTheWeek = dayOfTheWeek == 2 || dayOfTheWeek == 3 ? 2 : 1;

    let givenXp = random(10, 20) * dayOfTheWeek;

    try {
        const xp = await xpModel.findOne({
            userId: String(message.author.id),
            guildId: String(message.guild.id)
        });

        if(xp) {
            xp.xp += givenXp;

            await xp.save().catch((e) => {
                console.log("xp.js: ", e);
                return;
            });

            sentRecently.add(message.author.id);
            setTimeout(() => {
                sentRecently.delete(message.author.id);
            }, 15000);

            const server = await serverModel.findOne({
                guildId: message.guild.id
            });

            if(server && server.levelRoles?.length != 0) {
                server.levelRoles.forEach(async (x) => {
                    if(Math.floor(xp.xp / 5000) >= x.level && !xp.rolesGiven.includes(x.roleId)) {
                        let role = await message.guild.roles.fetch(x.roleId);

                        if(role) {
                            message.member.roles.add(role)
                            .catch((e) => console.log("xp.js: ", e))
                            .then(() => {
                                xp.rolesGiven.push(x.roleId);

                                xp.save();
                            });
                        }
                    }
                })
            }

        } else {
            xpModel.create({
                userId: String(message.author.id),
                guildId: String(message.guild.id),
                xp: givenXp,
                rolesGiven: []
            });

            sentRecently.add(message.author.id);
            setTimeout(() => {
                sentRecently.delete(message.author.id);
            }, 15000);
        }
    } catch (err) {
        console.log("xp.js: ", err);
    }

}