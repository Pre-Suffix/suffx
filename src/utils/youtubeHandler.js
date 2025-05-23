const fetch = require("./fetch");
const youtubesearchapi = require("youtube-search-api");
const youtubedl = require("youtube-dl-exec");

/**
 * 
 * @param { String } query 
 * @returns { Object }
 */
exports.getRecommendations = (query) => {
    const timeLimit = new Promise((res, rej) => {
        setTimeout(() => {
            res([query]);
        }, 1000);
    });

    return Promise.race([timeLimit, fetch.json("https://pipedapi.kavin.rocks/suggestions?query=" + encodeURI(query))]);
}

/**
 * 
 * @param { String } query 
 * @returns { Object }
 */
exports.getVideo = async (query) => {
    try {
        const searchResults = await youtubesearchapi.GetListByKeyword(query, false, 1, {type: "video"});

        if(searchResults.items[0]?.type == "video") return searchResults.items[0];
        else return {error: "No results."};
    } catch (error) {
        console.log("youtubeHandler.js: ", error);
        return {error: "No results."};
    }
}

/**
 * @typedef { Object } streamInfo
 * @property { String } url
 * @property { String } name
 * @property { String } thumbnail
 * @property { Boolean } livestream
 * @property { Number | false } duration
 */

/**
 * 
 * @param { String } id 
 * @returns { streamInfo }
 */
exports.getStream = async (id) => {
    try {
        const video = await youtubedl("https://www.youtube.com/watch?v=" + id, {
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
        const duration = video.duration == 0 ? false : Math.round(video.duration);

        return {
            url, name, thumbnail, livestream, duration
        };
    } catch (error) {
        console.log("youtubeHandler.js: ", error);
        return { error: "Stream could not be obtained." };
    }
}

/**
 * Retrieves all videos from a playlist
 * @param { String } id
 * @returns { Object }
 */
exports.getPlaylist = async (id) => {
    try {
        const playlist = await youtubesearchapi.GetPlaylistData(id);

        if(playlist.items.length > 0) return playlist.items;
        else return {error: "No videos in the playlist."};
    } catch (error) {
        console.log("youtubeHandler.js: ", error);
        return { error: "Something went wrong when fetching for the playlist." };
    }
}