const Discord = require("discord.js");
let Client = null;

/**
 * 
 * @param { Discord.Client } client 
 */

exports.set = (client) => { Client = client; }

/**
 * 
 * @returns { Discord.Client | null}
 */

exports.get = () => { return Client; }