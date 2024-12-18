const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const fetch = require("../utils/fetch");
let translation = {
    "BKN": "BROKEN",
    "OVC": "OVERCAST",
    "SCT": "SCATTERED",
    "FEW": "FEW"
};


function getWX(wx) {
    if(wx == null) return "None";
    let o = [];

    wx = wx.split(" ");
    wx.forEach((v) => {
        let a = "";
        if(v.startsWith("-")) a = "Light ";
        else if(v.startsWith("+")) a = "Severe ";

        if(v.includes("TS") && v.includes("RA")) a += "Thunderstorm with Rain";
        else if(v.includes("TS")) a += "Thunderstorm";
        else if(v.includes("SN")) a += "Snow";
        else if(v.includes("RA")) a += "Rain"
        else if(v.includes("FG")) a += "Fog";
        else return;

        o.push(a);
    });

    return o.join(", ");
}

module.exports = {
    name: "metar",
    description: "Retrieves the METAR report for a given airport.",
    options: [
        {
            name: "airport",
            description: "ICAO code for the airport.",
            required: true,
            type: ApplicationCommandOptionType.String,
            min_length: 4,
            max_length: 4
        }
    ],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        let metar = await fetch.json(`https://aviationweather.gov/cgi-bin/data/metar.php?ids=${interaction.options.getString("airport")}&hours=0&order=id%2C-obs&sep=true&format=json`);

        if(metar.length == 0) return interaction.reply("Invalid ICAO code.");

        metar = metar[0];

        let metarEmbed = new EmbedBuilder()
        .setAuthor({
            name: `Info for ${metar.icaoId}`
        })
        .setColor(process.env.SUFFXCOLOR)
        .setTimestamp(new Date(metar.reportTime + "Z"))
        .addFields([
            {
                name: "Raw METAR",
                value: metar.rawOb,
                inline: false
            }, {
                name: "Altimeter",
                value: String(Math.round(metar.altim)) + "hpa",
                inline: true
            }, {
                name: "Temperature",
                value: String(metar.temp) + "°C",
                inline: true
            }, {
                name: "Dew point",
                value: String(metar.dewp) + "°C",
                inline: true
            }, {
                name: "Visibility",
                value: String(Math.round(+(String(metar.visib).replace(/\+/g, "")) * 16.665) * 100) + "m",
                inline: true
            }, {
                name: "Wind",
                value: metar.wspd == 0 ? "None" : `${metar.wdir}@${metar.wspd}kt${metar.wgst != null ? " gusting " + String(metar.wgst) + "kt" : ""}`,
                inline: true
            }, {
                name: "Weather Phenomenon",
                value: getWX(metar.wxString),
                inline: true
            }
        ]);

        let clouds = [];
        metar.clouds.forEach((v) => {
            if(v.cover != "CAVOK") clouds.push(`${translation[v.cover]} at ${v.base}`);
        });

        if(clouds != []) metarEmbed.addFields([{
            name: "Clouds",
            value: clouds.join("\n"),
            inline: false
        }]);

        interaction.reply({
            embeds: [
                metarEmbed
            ]
        });

    }
}