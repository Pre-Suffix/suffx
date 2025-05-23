const DiscordVoice = require("@discordjs/voice");
const Discord = require("discord.js");
const toDuration = require("../../utils/toDuration");
const queryParser = require("./queryParser");
const youtubeHandler = require("../../utils/youtubeHandler");
const errorEmbed = require("../../utils/errorEmbed");

/**
 * @type { Map<String, MusicSession> }
 */
let sessions = new Map();

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
 * Represents a music session.
 */
class MusicSession {

    /**
     * @type { Array<queueModel> }
     */
    queue;

    /**
     * @type { Array<queueModel> }
     */
    pastSongs;

    /**
     * @type { number }
     */
    volume;

    /**
     * @type { DiscordVoice.VoiceConnection }
     */
    connection;

    /**
     * @type { Discord.VoiceBasedChannel }
     */
    voiceChannel;
        
    /**
     * @type { Discord.TextBasedChannel }
     */
    textChannel;   
    
    /**
     * @type { DiscordVoice.AudioPlayer }
     */
    player;

    /**
     * @type { "none" | "track" | "queue" }
     */
    loopMode;

    /**
     * @type { DiscordVoice.AudioResource }
     */
    resource;

    /**
     * @type { Number }
     */
    startTS;

    /**
     * @type { Boolean }
     */
    skipping;

    /**
     * 
     * @param { DiscordVoice.VoiceConnection } connection 
     * @param { Discord.VoiceBasedChannel } voiceChannel 
     * @param { Discord.TextBasedChannel } textChannel 
     */
    constructor(connection, voiceChannel, textChannel) {
        this.connection = connection;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

        this.player = DiscordVoice.createAudioPlayer({
            behaviors: {
                maxMissedFrames: 250
            }
        });

        connection.subscribe(this.player);

        this.queue = [];
        this.pastSongs = [];
        this.resource = null;
        this.volume = 100;
        this.loopMode = "none";
        this.skipping = false;
        this.startTS = Math.floor(Date.now() / 1000);

        this.player.on("stateChange", (oldState, newState) => {
            this.stateChange(oldState, newState);
        });

        if(process.argv[2] == "--dev") this.player.on("debug", console.log);

    }
    
    /**
     * Creates an audio resource using a given queue index and starts playing it.
     * @param { Number } index 
     */
    async play(index = 0) {
        let track = this.queue[index];
        if(!track) return;
        
        const isAudio = await queryParser.isAudio(track.url);

        if(!isAudio && track.youtubeLink) {
            const id = queryParser.getId(track.youtubeURL);
            const stream = await youtubeHandler.getStream(id);

            this.queue[index].url = stream.url;
            track.url = stream.url;
        } else if(!isAudio && !track.youtubeLink) {
            this.textChannel.send({ embeds: [ errorEmbed("The source URL for `" + track.name + "` is no longer valid. Removing track from queue.") ] });
            this.queue.splice(index, 1);
            if(this.queue.length < 1) this.endOfQueue();
            else if(!!this.queue[index]) this.play(index);
            else this.play(0);

            return;
        }

        const resource = await DiscordVoice.createAudioResource(track.url, {
            inlineVolume: true
        });

        resource.volume.setVolume(this.volume / 100);
        this.resource = resource;

        this.player.play(resource);

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

        if(!!track.duration) fields.push({
            name: "Duration:",
            value: '`' + toDuration(track.duration) + '`',
            inline: true
        });

        this.textChannel.send({ embeds: [
            new Discord.EmbedBuilder()
            .setTitle("Now playing")
            .setFields(fields)
            .setColor(process.env.SUFFXCOLOR)
            .setThumbnail(track.youtubeThumbnail)
        ]});
    }

    /**
     * Handler for player's state change.
     * @param { DiscordVoice.AudioPlayerState } oldState 
     * @param { DiscordVoice.AudioPlayerState } newState 
     */
    async stateChange(oldState, newState) {
        if(oldState.status != "playing" || newState.status != "idle" || this.skipping) return;

        if(this.queue.length == 0) this.endOfQueue()
        else if(this.loopMode == "track") this.play(0);
        else if(this.loopMode == "queue" && this.queue.length == 1) {
            this.queue.unshift(...this.pastSongs);
            this.pastSongs = [];
            this.play(0);
        } else {
            this.pastSongs.push(this.queue.shift());
            if(this.queue.length > 0) this.play(0);
            else this.endOfQueue();
        }
    }

    /**
     * Handles when the queue ends.
     */
    endOfQueue() {
        this.textChannel.send({ embeds: [
            new Discord.EmbedBuilder()
            .setColor(process.env.SUFFXCOLOR)
            .setTitle("Queue has ended")
            .setDescription(`The current session's queue has reached the end and you have not enabled looping.\nIf you don't want the session to end, you can:\n- Restart from the beginning of the queue running \`/music restart\`\n- Add another track using \`/music add\`\nIf you do not do either, the bot will automatically end the music session and leave the voice channel <t:${Math.floor(Date.now() / 1000) + 60}:R>.`)
        ]});

        setTimeout(() => {
            if(this.queue.length < 1) this.destroy();
        }, 60000);
    }
    
    /**
     * Destroys the music session.
     */
    destroy() {
        try {
            this.queue = [];
            this.loopMode = "none";
            this.player.removeAllListeners();
            this.player.stop();
            this.connection.disconnect();
            this.connection.destroy();

            sessions.delete(this.textChannel.guildId);
        } catch (_) {
            console.log("sessionHandler.js: ", _);
        }

    }
}

exports.sessionClass = MusicSession;
exports.sessions = sessions;