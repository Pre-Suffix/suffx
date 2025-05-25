const youtubesearchapi = require("youtube-search-api");
const http = require("http");
const https = require("https");

/**
 * Checks whether a given URL resolves to an audio file.
 * @param { String } url 
 * @returns { Boolean }
 */

exports.isAudio = async (url, onRedirect = 0) => {
    if(!url) return false;
    else if(onRedirect >= 5) return false;

    try {
        const urlObject = new URL(url);
        const protocol = urlObject.protocol === "http:" ? http : https;

        /**
         * @type { http.IncomingMessage }
         */
        const response = await new Promise((res, rej) => {
            protocol.get(url, res).on("error", rej);
        });

        let redirectCodes = [301, 302, 303, 307, 308];

        if(redirectCodes.includes(response.statusCode) && !!response.headers["location"]) return this.isAudio(response.headers["location"], onRedirect + 1);

        if(response.statusCode >= 200 && response.statusCode < 300) {
            const contentType = response.headers["content-type"];
            if(!contentType) return false;
            else if(contentType.startsWith("audio/") || contentType == "application/vnd.apple.mpegurl" || contentType == "application/octet-stream") return true;
        }

        return false;
    } catch (_) {
        return false;
    }
    
}

/**
 * Returns the type of the query provided.
 * @param { String } query 
 * @returns { "url" | "youtubeVideo" | "youtubePlaylist" | "normalQuery" | "invalid" }
 */
exports.getType = async (query) => {
    let url = false;
    
    try {
        url = new URL(query);

        if (
            (url.host.endsWith("youtube.com") && url.pathname == "/watch" && String(url.searchParams.get("v")).length == 11) ||
            (url.host.endsWith("youtu.be") && url.pathname.length == 12)
        ) {
            const id = this.getId(query);
            await youtubesearchapi.GetVideoDetails(id);

            return "youtubeVideo";
        } else if (url.host.endsWith("youtube.com") && url.pathname == "/playlist" && String(url.searchParams.get("list")).length == 34) {
            const id = this.getId(query);
            await youtubesearchapi.GetPlaylistData(id);

            return "youtubePlaylist";
        } else {
            const audio = await this.isAudio(query);
            if(audio) return "url";
            
            return "normalQuery";
        }
    } catch (_) {
        if(url == false) return "normalQuery"; else return "invalid";
    }

    return "howdidwegethere?";
}

/**
 * Extracts the video ID from the URL.
 * @param { String } _url 
 * @returns { String }
 */
exports.getId = (_url) => {
    let url = new URL(_url);

    if(url.hostname.endsWith("youtu.be")) return url.pathname.substring(1);
    else if(url.host.endsWith("youtube.com") && url.pathname == "/playlist") return url.searchParams.get("list");

    return url.searchParams.get("v");
}