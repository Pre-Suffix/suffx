/**
 * Checks whether a given URL resolves to an audio file.
 * @param { String } url 
 * @returns { Boolean }
 */

exports.isAudio = async (url) => {
    if(!url) return false;

    try {
        let res = await fetch(url, { method: "HEAD", mode: "no-cors" });
        if(res.ok && (res.headers.get("content-type").startsWith("audio") || res.headers.get("content-type") == "application/vnd.apple.mpegurl") || res.headers.get("content-type") == "application/octet-stream") 
            return true;
    } catch (_) {
        return false;
    }

    return false;
}

/**
 * Returns the type of the query provided.
 * @param { String } query 
 * @returns { "url" | "youtubeVideo" | "youtubePlaylist" | "normalQuery" }
 */
exports.getType = (query) => {
    let url;
    
    try {
        url = new URL(query);

        if (
            (url.host.endsWith("youtube.com") && url.pathname == "/watch" && String(url.searchParams.get("v")).length == 11) ||
            (url.host.endsWith("youtu.be") && url.pathname.length == 12)
        ) return "youtubeVideo";
        else if (url.host.endsWith("youtube.com") && url.pathname == "/playlist" && String(url.searchParams.get("list")).length == 34) return "youtubePlaylist";
        else {
            const isAudio = this.isAudio(query);
            if(isAudio) return "url"; else return "normalQuery";
        }
    } catch (_) {
        return "normalQuery";
    }
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