const Discord = require("discord.js");
const DiscordVoice = require("@discordjs/voice");
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

        constructor.player.stop();

        constructor.queue = [...constructor.pastSongs, ...constructor.queue];
        constructor.pastSongs = [];

        let track = constructor.queue[0];
        
        const resource = await DiscordVoice.createAudioResource(track.url, {
            inlineVolume: true
        });

        resource.volume.setVolume(constructor.volume / 100);
    
        constructor["resource"] = resource;
        constructor.player.play(resource);

        constructors.update(interaction.guild.id, constructor);

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

        
    } else {
        interaction.editReply({ embeds: [ errorEmbed("You need to run `/music join` before running this command.", "Invalid syntax") ] });
    }
}