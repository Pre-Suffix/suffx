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
    let toTrack = interaction.options.getInteger("totrack") ?? 1;
    let constructor = constructors.get(interaction.guild.id);

    if(toTrack > constructor.queue.length) {
        interaction.editReply({ embeds: [ errorEmbed("Invalid track number.") ] });
        return;
    }

    for(var i = 0; i < toTrack - 1; ++i) {
        constructor.pastSongs.push(constructor.queue.shift());
    }

    let played = await constructors.playNext(interaction.guild.id);

    if(!played) {
        interaction.editReply({ embeds: [ errorEmbed("Playing next track.", null, process.env.SUFFXCOLOR) ]});

        constructor.pastSongs.push(...constructor.queue);
        constructor.queue = [];
        constructor.player.stop();

        constructors.update(interaction.guild.id, constructor);
    } else {
        constructor = constructors.get(interaction.guild.id);

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

        if(track.duration != null) fields.push({
            name: "Duration:",
            value: '`' + toDuration(track.duration) + '`',
            inline: true
        });

        interaction.editReply({ embeds: [
            new Discord.EmbedBuilder()
            .setTitle("Now playing")
            .setFields(fields)
            .setColor(process.env.SUFFXCOLOR)
            .setThumbnail(track.youtubeThumbnail)
        ]});
    }
}