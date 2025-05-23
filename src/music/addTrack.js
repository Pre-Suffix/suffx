const Discord = require("discord.js");
const DiscordVoice = require("@discordjs/voice");
const toDuration = require("../utils/toDuration");
const youtubeHandler = require("../utils/youtubeHandler");
const queryParser = require("./utils/queryParser");
const sessionHandler = require("./utils/sessionHandler");
const connectToChannel = require("./utils/connectToChannel");

function textToDuration(simpleText) {
    let total = 0;
    let time = simpleText.split(":").reverse();

    time.forEach((x, i) => {
        if(i == 0) total += +x;
        else if(i == 1) total += +x * 60;
        else if(i == 2) total += +x * 3600;
        else total += +x * 86400;
    });

    return total;
}

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */

module.exports = async (client, interaction) => {
    if(!interaction.member.voice?.channel) {
        interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                .setColor("Red")
                .setDescription("You must be connected to a voice channel to use the music functionality.")
            ]
        });

        return;
    }

    await interaction.deferReply();

    const query = interaction.options.getString("query");
    const queryType = queryParser.getType(query);

    let session;

    if(sessionHandler.sessions.has(interaction.guildId)) session = sessionHandler.sessions.get(interaction.guildId);
    else {
        const voiceChannel = interaction.member.voice.channel;
        const textChannel = interaction.channel;

        if(!voiceChannel.permissionsFor(interaction.guild.members.me).has(Discord.PermissionFlagsBits.Speak) || 
           !voiceChannel.permissionsFor(interaction.guild.members.me).has(Discord.PermissionFlagsBits.Connect)) {
            interaction.reply({ embeds: [ errorEmbed("I cannot connect to or speak in the voice channel you're in. Please connect to another one or contact an admin to fix the permissions.") ] });
            return;
        }

        const connection = await connectToChannel(voiceChannel);

        sessionStarting = true;
        sessionHandler.sessions.set(interaction.guildId, new sessionHandler.sessionClass(connection, voiceChannel, textChannel));

        interaction.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(process.env.SUFFXCOLOR)
                .setDescription(`Music session initialized. To use the music functionality, send your commands on <#${textChannel.id}> and be connected to <#${voiceChannel.id}>.`)
            ]
        });

        session = sessionHandler.sessions.get(interaction.guildId);
        startOfSession = true;
    }

    if(session.voiceChannel.id != interaction.member.voice?.channel.id || session.textChannel.id != interaction.channel.id) {
        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                .setColor("Red")
                .setDescription(`To use the music functitonality, connect to <#${session.voiceChannel.id}> and send your commands on <#${session.textChannel.id}>.`)
            ]
        });

        return;
    }

    let queueLength = session.queue.length;

    session.skipping = true;

    if(queryType == "url") {
        let name = new URL(query).pathname.split("/").pop();

        session.queue.push({
            url: query,
            name,
            requestedBy: interaction.user.id.toString(),
            youtubeUrl: false,
            youtubeLink: false,
            live: false,
            duration: false,
            youtubeThumbnail: null
        });
    } else if(queryType == "youtubeVideo") {
        const id = queryParser.getId(query);
        const stream = await youtubeHandler.getStream(id);

        session.queue.push({
            url: stream.url,
            name: stream.name,
            requestedBy: interaction.user.id.toString(),
            youtubeURL: query,
            youtubeLink: true,
            live: stream.livestream,
            duration: stream.duration,
            youtubeThumbnail: stream.thumbnail
        });
    } else if(queryType == "normalQuery") {
        const video = await youtubeHandler.getVideo(query);

        if(!!video.error) {
            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setDescription("No videos were found for your query. Try something else.")
                ]
            });

            return;
        }

        const stream = await youtubeHandler.getStream(video.id);
        
        session.queue.push({
            url: stream.url,
            name: stream.name,
            requestedBy: interaction.user.id.toString(),
            youtubeURL: "https://youtube.com/watch?v=" + video.id,
            youtubeLink: true,
            live: stream.livestream,
            duration: stream.duration,
            youtubeThumbnail: stream.thumbnail
        });
    } else {
        const id = queryParser.getId(query);
        const playlist = await youtubeHandler.getPlaylist(id);

        if(!!playlist.error) {
            interaction.editReply({ embeds: [ errorEmbed("There was an error fetching this playlist. Try again later.") ] });
            return;
        }

        let t = 0;

        for(let i = 0; i < playlist.length; ++i) {
            let video = playlist[i];
            
            if(video.type != "video") continue;

            session.queue.push({
                url: null,
                name: video.title,
                requestedBy: interaction.user.id.toString(),
                youtubeURL: "https://youtube.com/watch?v=" + video.id,
                youtubeLink: true,
                live: video.isLive,
                duration: textToDuration(video.length.simpleText),
                youtubeThumbnail: video.thumbnail.thumbnails.pop().url
            });

            t++;
        }

        if(queueLength < 1)
            await session.play(0);

        session.skipping = false;

        interaction.editReply({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setTitle("Added to queue")
            .setDescription(`Successfully added to queue ${t}/${playlist.length} videos from the playlist.`)
        ]});

        return;
    }

    if(queueLength < 1)
        await session.play(0);

    session.skipping = false;

    let track = session.queue[session.queue.length - 1];
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

    if(!!track.duration) fields.push(...[
        {
            name: "Duration:",
            value: '`' + toDuration(track.duration) + '`',
            inline: true
        }
    ]);

    interaction.editReply({ embeds: [
        new Discord.EmbedBuilder()
        .setTitle("Added to queue")
        .setFields(fields)
        .setColor(process.env.SUFFXCOLOR)
        .setThumbnail(track.youtubeThumbnail)
        .setDescription(track.live ? "ℹ️ *This content is live, therefore it will not stop playing until the livestream is over.*" : null)
    ]});
}