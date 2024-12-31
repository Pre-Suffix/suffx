const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");
const fetch = require("../../utils/fetch");
const toDuration = require("./utils/toDuration");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */

async function getPlaylist(url) {
    let u;

    try {
        u = new URL(url);
        if(u.hostname.endsWith("youtube.com") && u.pathname == "/playlist" && u.searchParams.get("list").length == 34) {
            const playlist = await fetch.json("https://pipedapi.kavin.rocks/playlists/" + u.searchParams.get("list"));
            if(playlist.error) return false;
            return playlist;
        } else if(u.hostname.endsWith("youtube.com") && u.pathname == "/watch" && u.searchParams.get("list").length == 34) {
            const playlist = await fetch.json("https://pipedapi.kavin.rocks/playlists/" + u.searchParams.get("list"));
            if(playlist.error) return false;
            return playlist;
        }
        else return false;
    } catch (error) {
        return false;
    }
}

module.exports = async (client, interaction) => {
    let playlist = interaction.options.getString("playlist");
    const playlistJSON = await getPlaylist(playlist);

    if(!playlistJSON) {
        interaction.editReply({ embeds: [ errorEmbed("The URL you specified isn't a valid YouTube Playlist URL.", "Invalid URL") ] });
        return;
    } else if(playlistJSON.relatedStreams.length < 1) {
        interaction.editReply({ embeds: [ errorEmbed("The playlist has no videos.") ] });
        return;
    }

    try {

        let totalDuration = 0;
        let videosAdded = 0;

        for(var video of playlistJSON.relatedStreams) {
            const added = await constructors.add(
                interaction.guild.id, 
                null, 
                video.title, 
                String(interaction.user.id), 
                video.duration, 
                false, 
                true, 
                "https://youtube.com" + video.url,
                `https://i.ytimg.com/vi/${video.url.slice(-11)}/maxresdefault.jpg`
            );

            if(added) {
                ++videosAdded;
                totalDuration += video.duration;
            }
        }

        interaction.editReply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setDescription(`Successfully added playlist [\`${playlistJSON.name.replace(/`/g, "'")}\`](https://youtube.com/playlist?list=${new URL(playlist).searchParams.get("list")}).`)
            .setFields([
                {
                    name: "Tracks added:",
                    value: String(videosAdded),
                    inline: true
                }, {
                    name: "Requested by:",
                    value: `<@${interaction.user.id}>`,
                    inline: true
                }, {
                    name: "Total Duration:",
                    value: '`' + toDuration(totalDuration) + '`',
                    inline: true
                }
            ])
            .setThumbnail(playlistJSON.thumbnailURL)
            .setFooter(playlistJSON.relatedStreams.length >= 100 ? { text: "The bot only supports adding up to 100 videos at a time. If your playlist had more than 100 videos, not all of them were added." } : null)
        ]});
    } catch (error) {
        interaction.editReply({ embeds: [ errorEmbed("There was an error adding the playlist. Try again later.") ] });
        return;
    }   
}