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
    let constructor = constructors.get(interaction.guild.id);

    if(constructor.queue?.length == 0) {
        interaction.editReply({ embeds: [ errorEmbed("There are no songs playing.", null) ] });
        return;
    }

    let track = constructor.queue[0];
    let fields = [
        {
            name: "Track:",
            value: `[\`${track.name}\`](${track.youtubeLink ? track.youtubeURL : track.url})`,
            inline: true
        }, {
            name: "Requested by:",
            value: `<@${track.requestedBy}>`,
            inline: true
        }
    ];

    if(track.duration != null) fields.push(...[
        {
            name: "Duration:",
            value: '`' + toDuration(track.duration) + '`',
            inline: true
        }, {
            name: "Progress:",
            value: `\`${toDuration(constructor.resource.playbackDuration / 1000)} [${Array(Math.floor((constructor.resource.playbackDuration / 1000 / track.duration) * 25)).fill("#").join("")}${Array(25 - Math.floor((constructor.resource.playbackDuration / 1000 / track.duration) * 25)).fill("-").join("")}] ${toDuration(track.duration)}\``,
            inline: false
        }
    ]);
    else fields.push({
        name: "Played for:",
        value: '`' + toDuration(constructor.resource.playbackDuration / 1000) + '`',
        inline: true
    });

    interaction.editReply({ embeds: [
        new Discord.EmbedBuilder()
        .setTitle("Now playing")
        .setFields(fields)
        .setColor(process.env.SUFFXCOLOR)
        .setThumbnail(track.youtubeThumbnail)
        .setDescription(track.live ? "ℹ️ *This content is live, therefore it will not stop playing until the livestream is over.*" : null)
    ]});
}