const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");
const toDuration = require("./utils/toDuration");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    const vc = interaction.guild.members.me.voice.channel;

    if(vc && constructors.has(interaction.guild.id)) {

        let constructor = constructors.get(interaction.guild.id);
        
        if(constructor.queue.length == 0) {
            interaction.editReply({ embeds: [ errorEmbed("There are no songs in the queue.", null) ] });
        } else {
            let desc = [];
            let queue = constructor.queue;

            queue.forEach((x, i) => {
                if(i < 11) {
                    desc.push(
                        `${i == 0 ? "" : "**" + i + ".** "}[\`${x.live ? "🔴 Live` `" : ""}${x.name}\`](${x.youtubeLink ? x.youtubeURL : x.url}) • <@${x.requestedBy}>`
                        + (x.duration == null ? "" : ` • \`${toDuration(x.duration)}\``)
                    );
                }
            });

            const embed = new Discord.EmbedBuilder()
            .addFields({
                name: "Now playing:",
                value: desc.shift()
            })
            .setColor(process.env.SUFFXCOLOR);

            if(queue.length > 11) desc.push(`*There are ${queue.length - 11} songs more that weren't shown.*`);

            if(desc.length != 0) embed.setDescription(desc.join("\n\n")).setAuthor({ name: "Next up:" });

            if(constructor.onRepeat) embed.setFooter({ text: `🔁 Looping is enabled. The queue will restart from the beginning after the last track ends.` });

            interaction.editReply({ embeds: [ embed ]});
        }
        
    } else {
        interaction.editReply({ embeds: [ errorEmbed("You need to run `/music join` before running this command.", "Invalid syntax") ] });
    }
}