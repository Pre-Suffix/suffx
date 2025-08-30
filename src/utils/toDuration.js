/**
 * 
 * @param { Number } seconds 
 * @returns { String }
 */

let pad = (v) => { return `${v < 10 ? "0" : ""}${v}`; }


/**
 * Returns a formatted string (HHMMSS) corresponding to the given duration in seconds.
 * @param { Number } seconds 
 * @returns { String }
 */
module.exports = (seconds = 0) => {
    let r = "";

    r += `${pad(Math.floor(seconds / 3600))}:`;
    r += `${pad(Math.floor((seconds % 3600) / 60))}:`;
    r += `${pad(Math.floor(seconds) % 60)}`;

    return r;
}