const Discord = require("discord.js");
const constructors = require("./utils/constructor");
const youtubedl = require("youtube-dl-exec");
const errorEmbed = require("../../utils/errorEmbed");
const fetch = require("../../utils/fetch");
const toDuration = require("./utils/toDuration");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */

function isURL(url) {
    let u;

    try {
        u = new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

function isValid(url) {
    url = new URL(url);
    if(url.hostname.endsWith("youtu.be") && url.pathname.length == 12) return true;
    if(url.hostname.endsWith("youtube.com") && url.pathname == "/watch" && url.searchParams.get("v").length == 11) return true;

    return false;
}

module.exports = async (client, interaction) => {
    const vc = interaction.guild.members.me.voice.channel;
    let query = interaction.options.getString("query");

    if(vc && constructors.has(interaction.guild.id)) {

        const isurl = isURL(query);

        if(!isurl) {
            const searchResults = await fetch.json(`https://pipedapi.kavin.rocks/search?q=${query}&filter=videos`);

            if(searchResults.items?.length < 1) {
                interaction.editReply({ embeds: [ errorEmbed("No video was found with your query.", "Invalid query") ] });
                return;
            }

            query = `https://www.youtube.com${searchResults.items[0].url}`;
        }

        const valid = isValid(query);

        if(!valid) {
            interaction.editReply({ embeds: [ errorEmbed("The URL you specified isn't a valid YouTube URL.", "Invalid URL") ] });
            return;
        }

        try {
            const video = await youtubedl(query, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
                format: "ba, ba[protocol=m3u8_native]"
            });

            const url = video.requested_downloads.pop().url;
            const name = video.title;
            const thumbnail = video.thumbnail;
            const livestream = video.live_status == "is_live";
            const duration = video.duration == 0 ? null : video.duration;

            const added = constructors.add(interaction.guild.id, url, name, String(interaction.user.id), duration, livestream, true, query, thumbnail);

            if(added) interaction.editReply({ embeds: [
                new Discord.EmbedBuilder()
                .setColor(process.env.SUFFXCOLOR)
                .setFields([
                    {
                        name: "Track queued:",
                        value: `[\`${name}\`](${query})`,
                        inline: true
                    }, {
                        name: "Requested by:",
                        value: `<@${interaction.user.id}>`,
                        inline: true
                    }, {
                        name: "Duration:",
                        value: '`' + toDuration(duration) + '`',
                        inline: true
                    }
                ])
                .setDescription(livestream ? "ℹ️ *This content is live, therefore it will not stop playing until it's manually skipped.*" : null)
                .setThumbnail(thumbnail)
            ]});
            else interaction.editReply({ embeds: [ errorEmbed("There was an issue adding your song to the queue.") ] });
        } catch (error) {
            interaction.editReply({ embeds: [ errorEmbed("The URL you specified isn't a valid YouTube URL.", "Invalid URL") ] });
            return;
        }   
    } else {
        interaction.editReply({ embeds: [ errorEmbed("You need to run `/music join` before running this command.", "Invalid syntax") ] });
    }
}