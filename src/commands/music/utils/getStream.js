const Stream = require("stream");

/**
 * 
 * @param { String } url 
 * @returns { Stream.Readable }
 */

module.exports = async (url) => {
    const readableStream = await fetch(url).then(r => Stream.Readable.fromWeb(r.body))

    return readableStream;
}