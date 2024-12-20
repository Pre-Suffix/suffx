const { Collection } = require("discord.js");

/**
 * 
 * @param { Collection } attachments 
 */

module.exports = (attachments) => {
    let image = null;
    attachments.forEach((x) => image = String(x.contentType).startsWith("image") && image == null ? x.url : null);

    return image;
}