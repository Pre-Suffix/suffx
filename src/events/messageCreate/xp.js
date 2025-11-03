const { Client, Message, PermissionFlagsBits } = require("discord.js");
const random = require("../../utils/random");
const memberModel = require("../../models/memberModel");
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
        const user = await memberModel.findOne({
            userId: String(message.author.id),
            guildId: String(message.guild.id)
        });

        if(user) {
            user.xp += givenXp;
            user.admin = message.member.permissions.has(PermissionFlagsBits.Administrator) ?? false;

            await user.save().catch((e) => {
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
                    if(Math.floor(Math.log2(user.xp / 1000)) + 1 >= x.level && !user.rolesGiven.includes(x.roleId)) {
                        let role = await message.guild.roles.fetch(x.roleId);

                        if(role) {
                            message.member.roles.add(role)
                            .catch((e) => console.log("xp.js: ", e))
                            .then(() => {
                                user.rolesGiven.push(x.roleId);

                                user.save();
                            });
                        }
                    }
                })
            }

        } else {
            memberModel.create({
                userId: String(message.author.id),
                guildId: String(message.guild.id),
                admin: message.member.permissions.has(PermissionFlagsBits.Administrator) ?? false,
                xp: givenXp,
                rolesGiven: [],
                leftWithRoles: []
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