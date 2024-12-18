const fetch = require("../utils/fetch");

module.exports = {
    name: "inspireme",
    description: "Generates a truly inspiring image, just for you.",
    options: [],
    permissionsRequired: [],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        let inspireurl = await fetch.raw("https://inspirobot.me/api?generate=true");
        interaction.editReply({
            content: inspireurl
        });
    }
}