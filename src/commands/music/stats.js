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

        if(constructor.queue?.length == 0) {
            interaction.editReply({ embeds: [ errorEmbed("Queue is empty! Add some songs before running this command", null) ] });
            return;
        }

        let track = constructor.queue[0];

        interaction.editReply({ embeds: [
            new Discord.EmbedBuilder()
            .setTitle("🎶 Music Session stats")
            .setFields(...[
                {
                    name: "⌚ Started",
                    value: `<t:${constructor.startTS}:R>`,
                    inline: true
                }, {
                    name: "💿 Musics on queue",
                    value: (constructor.queue.length + constructor.pastSongs.length) + " music" + (constructor.queue.length > 1 ? "s" : ""),
                    inline: true
                }, {
                    name: "🔁 Looping",
                    value: constructor.onRepeat ? "Enabled" : "Disabled",
                    inline: true
                },{
                    name: "📻 Playing on",
                    value: `<#${constructor.voiceChannel.id}>`,
                    inline: true
                }, {
                    name: "🎚️ Volume",
                    value: constructor.volume + "%",
                    inline: true
                }, {
                    name: "🔈 Now Playing",
                    value: `[\`${track.live ? "🔴 Live` `" : ""}${track.name}\`](${track.youtubeLink ? track.youtubeURL : track.url}) • <@${track.requestedBy}>`
                    + (track.duration == null ? "" : ' • ' + toDuration(track.duration)),
                    inline: false
                }
            ])
            .setColor(process.env.SUFFXCOLOR)
            .setImage(track.youtubeThumbnail)
        ]});
        
    } else {
        interaction.editReply({ embeds: [ errorEmbed("You need to run `/music join` before running this command.", "Invalid syntax") ] });
    }
}