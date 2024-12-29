/**
 * 
 * @param { String } url 
 * @returns { Boolean }
 */

module.exports = async (url) => {
    let r = false;
    try {
        let res = await fetch(url, { method: "HEAD", mode: "no-cors" });
        if(res.ok && (res.headers.get("content-type").startsWith("audio") || res.headers.get("content-type") == "application/vnd.apple.mpegurl")) 
            r = res.headers.get("content-size");
    } catch (error) {
        (() => {})();
    }
    return r;
}