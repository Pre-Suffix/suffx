const DiscordVoice = require("@discordjs/voice");
const Discord = require("discord.js");
const errorEmbed = require("../../../utils/errorEmbed");
const toDuration = require("./toDuration");
const youtubedl = require("youtube-dl-exec");
let constructors = new Map();

/**
 * @typedef { Object } queueModel
 * @property { String } url
 * @property { String } name
 * @property { String } requestedBy
 * @property { Number } duration
 * @property { Boolean } live
 * @property { Boolean } youtubeLink
 * @property { String } youtubeURL
 * @property { String } youtubeThumbnail
 */

/**
 * @typedef { Object } constructorModel
 * @property { DiscordVoice.AudioPlayer } player
 * @property { Array<queueModel> } queue
 * @property { Array<queueModel> } pastSongs
 * @property { DiscordVoice.VoiceConnection } connection
 * @property { Discord.VoiceBasedChannel } voiceChannel
 * @property { Discord.TextBasedChannel } textChannel
 * @property { DiscordVoice.AudioResource } resource
 * @property { Number } volume
 * @property { Boolean } onRepeat
 * @property { Number } startTS
 */

/**
 * 
 * @param { String } guildId 
 * @returns { Boolean }
 */

exports.has = (guildId) => {
    return constructors.has(String(guildId));
}

/**
 * 
 * @param { String } guildId 
 * @returns { constructorModel }
 */

exports.get = (guildId) => {
    return constructors.get(String(guildId));
}

/**
 * 
 * @param { String } guildId 
 * @returns { constructorModel }
 */

exports.create = async (guildId) => {
    const player = await DiscordVoice.createAudioPlayer({
        behaviors: {
            maxMissedFrames: 250
        },
//        debug: true
    });

    player.on("stateChange", async (oldState, newState) => {

        if(!(oldState.status == "playing" && newState.status == "idle")) return;      

        let constructor = this.get(guildId);

        let played = await this.playNext(guildId);

        if(played) {
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

            constructor.textChannel.send({ embeds: [
                new Discord.EmbedBuilder()
                .setTitle("Now playing")
                .setFields(fields)
                .setColor(process.env.SUFFXCOLOR)
                .setThumbnail(track.youtubeThumbnail)
            ]});

        } else {                            
            constructor.player.stop();

            this.queueOver(guildId);
        }

    });

//    player.on("debug", msg => console.log(msg));

    player.on("error", (error) => {
        console.log("constructor.js: ", error);
    });

    const constructor = {
        player,
        queue: [],
        pastSongs: [],
        volume: 100,
        onRepeat: false,
        startTS: Math.floor(Date.now() / 1000)
    };

    constructors.set(String(guildId), constructor);

    return constructor;
}

/**
 * 
 * @param { String } guildId 
 * @returns { Boolean }
 */

exports.delete = (guildId) => {
    try {
        let constructor = this.get(guildId);
        if(constructor.connection != undefined) {
            constructor.connection.disconnect();
            constructor.connection.destroy();
        }
    
    } catch (error) {
        console.log("constructor.js: ", error);
    }

    return constructors.delete(String(guildId));
}

/**
 * 
 * @param { String } guildId 
 * @param { constructorModel } constructor
 */

exports.update = (guildId, constructor = {}) => {
    constructors.set(String(guildId), constructor);
}

/**
 * 
 * @param { String } guildId 
 * @param { String } url 
 * @param { String } name 
 * @param { String } requestedBy 
 * @param { Number } duration 
 * @param { Boolean } live 
 * @param { Boolean } youtubeLink 
 * @param { String } youtubeURL 
 * @param { String } youtubeThumbnail 
 * @returns { Boolean }
 */
exports.add = async (guildId, url, name, requestedBy, duration, live, youtubeLink, youtubeURL, youtubeThumbnail) => {
    try {
        let constructor = this.get(guildId);

        constructor.queue.push({ 
            url: url, 
            name: String(name), 
            requestedBy: String(requestedBy), 
            youtubeURL: youtubeURL ?? null, 
            youtubeLink: youtubeLink ?? false, 
            live: live ?? false, 
            duration: duration ?? null, 
            youtubeThumbnail: youtubeThumbnail ?? null
        });

        if(constructor.connection.state.status == "idle" || constructor.queue.length == 1) {
            if(url == null && youtubeLink) {
                const videoURL = await youtubedl(youtubeURL, {
                    getUrl: true,
                    noCheckCertificates: true,
                    noWarnings: true,
                    preferFreeFormats: true,
                    addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
                    format: "ba[protocol=m3u8_native]"
                });

                url = videoURL;
                constructor.queue[0].url = videoURL;
            }

            const resource = await DiscordVoice.createAudioResource(url, {
                inlineVolume: true
            });

            resource.volume.setVolume(constructor.volume / 100);

            constructor["resource"] = resource;

            constructor.player.play(resource);
        }

        this.update(guildId, constructor);

        return true;
    } catch (error) {
        console.log("constructor.js: ", error);
        return false;
    }
}

/**
 * 
 * @param { String } guildId 
 * @returns { Boolean }
 */

exports.playNext = async (guildId, constructor = this.get(guildId)) => {
    try {
        if(constructor.queue.length <= 1) return false;
        
        constructor.pastSongs.push(constructor.queue.shift());

        let track = constructor.queue[0];

        if(track.url == null && track.youtubeLink) {
            const videoURL = await youtubedl(track.youtubeURL, {
                getUrl: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
                format: "ba[protocol=m3u8_native]"
            });

            track.url = videoURL;
            constructor.queue[0].url = videoURL;
        }

        const resource = await DiscordVoice.createAudioResource(track.url, {
            inlineVolume: true
        });

        resource.volume.setVolume(constructor.volume / 100);
    
        constructor["resource"] = resource;
        constructor.player.play(resource);

        this.update(guildId, constructor);
        return true;
    } catch (error) {
        console.log("constructor.js: ", error);
        return false;
    }
}

/**
 * 
 * @param { String } guildId 
 */

exports.queueOver = async (guildId) => {
    try {
        let constructor = this.get(guildId);

        if(constructor.onRepeat) {
            constructor.queue = [ ...constructor.pastSongs, ...constructor.queue ];
            constructor.pastSongs = [];

            let track = constructor.queue[0];

            const resource = await DiscordVoice.createAudioResource(track.url, {
                inlineVolume: true
            });
    
            resource.volume.setVolume(constructor.volume / 100);
        
            constructor["resource"] = resource;
            constructor.player.play(resource);
    
            this.update(guildId, constructor);

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

            constructor.textChannel.send({ embeds: [
                new Discord.EmbedBuilder()
                .setTitle("Now playing")
                .setFields(fields)
                .setColor(process.env.SUFFXCOLOR)
                .setThumbnail(track.youtubeThumbnail)
            ]});

        } else {
            constructor.pastSongs.push(...constructor.queue);
            constructor.queue = [];
            constructor.resource = null;

            this.update(guildId, constructor);

            let msg = await constructor.textChannel.send({ embeds: [ errorEmbed(`The bot will leave VC <t:${Math.floor(Date.now() / 1000) + 61}:R> if no new songs are added.`, "Queue has ended", process.env.SUFFXCOLOR) ] });

            setTimeout(() => {
                if(this.has(guildId)) {
                    constructor = this.get(guildId);

                    if(constructor.queue.length == 0) {
                        this.delete(guildId);

                        msg.edit({ embeds: [ errorEmbed("Leaving voice channel. If you wish to play a song again, start over with `/music join`", null, process.env.SUFFXCOLOR) ] });
                    }
                }
            }, 60000);
        }

    } catch (error) {
        console.log("constructor.js: ", error);
    }
}