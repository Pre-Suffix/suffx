const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const isAudio = require("./utils/isAudio");
const errorEmbed = require("../../utils/errorEmbed");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    const vc = interaction.guild.members.me.voice.channel;
    const murl = interaction.options.getString("url");

    if(vc && constructors.has(interaction.guild.id)) {

        const isaudio = await isAudio(murl);

        if(isaudio == false) {
            interaction.editReply({ embeds: [ errorEmbed("Provided URL is not an audio file.", "Invalid URL") ] });
            return;
        }

        let name = new URL(murl).pathname.split("/").pop();

        const added = constructors.add(interaction.guild.id, murl, name, String(interaction.user.id));

        if(added) interaction.editReply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setFields([
                {
                    name: "Track queued:",
                    value: `[\`${new URL(murl).pathname.split("/").pop()}\`](${murl})`,
                    inline: true
                }, {
                    name: "Requested by:",
                    value: `<@${interaction.user.id}>`,
                    inline: true
                }
            ])
        ]});
        else interaction.editReply({ embeds: [ errorEmbed("There was an issue adding your song to the queue.") ] });
    } else {
        interaction.editReply({ embeds: [ errorEmbed("You need to run `/music join` before running this command.", "Invalid syntax") ] });
    }
}