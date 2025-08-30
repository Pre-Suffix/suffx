const { Client, CommandInteraction, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const soapboxModel = require("../../models/soapboxModel");

/**
 * 
 * @param { Client } client
 * @param { CommandInteraction } interaction
 */
module.exports = async (client, interaction) => {
    if(!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        interaction.reply("You don't have enough permissions to run this command.");
        return;
    }

    let soapbox = await soapboxModel.findOne({
        guildId: interaction.guild.id
    });

    if(!soapbox) {
        interaction.reply("There is no soapbox instance configured in this server.");
        return;
    }
    
    let embed = new EmbedBuilder()
    .setColor(process.env.SUFFXCOLOR)
    .setTitle("ℹ️ Soapbox Info")
    .setDescription(!!soapbox.started ? "🟩 This instance is currently active" : "🟥 This instance isn't currently active")
    .addFields([
        {
            name: "📜 Channel",
            value: `<#${soapbox.channelId}>`,
            inline: true
        }, {
            name: "👥 Registered Users",
            value: `${soapbox.userList.length} users`,
            inline: true
        }, {
            name: "🗣️ Talked this session",
            value: `${soapbox.alreadyTalked.length} users`,
            inline: true
        }
    ]);

    if(!!soapbox.started) {
        let userList = [...soapbox.userList];
        soapbox.userList.forEach((v) => {
            if(soapbox.alreadyTalked.includes(v))
                userList.splice(userList.indexOf(v), 1);
        });

        embed.addFields([
            {
                name: "🎙️ On the Soapbox",
                value: `<@${soapbox.soapboxUser}> until <t:${soapbox.steppedOn + soapbox.roundDuration}>`,
                inline: false
            }, {
                name: "✅ Eligibility Role",
                value: `<@&${soapbox.eligibilityRole}>`,
                inline: true
            }, {
                name: "⏱️ Time left in session",
                value: `approx. <t:${Math.round(Date.now() / 1000) + (userList.length * soapbox.roundDuration) + (soapbox.steppedOn + soapbox.roundDuration - Math.round(Date.now() / 1000))}:R>`,
                inline: true
            }
        ]);
    }

    interaction.reply({ embeds: [ embed ] });

};