const timezones = require("../../json/timezones.json");
const Fuse = require('fuse.js');

module.exports = async (client, interaction) => {
    if(!interaction.isAutocomplete()) return;

    if(!interaction.inGuild()) {
        interaction.reply({ content: "Support for direct message commands isn't available." });
        return;
    }

    if(interaction.options.getFocused(true).name === "timezone" && interaction.commandName === "minutecryptic") { 
        const timezone = interaction.options.getString("timezone");
        if(timezone == '') {
            await interaction.respond([{name: "Type in your timezone (ex. Europe/London)", value: "Europe/London"}]);
            return;
        }

        const fuse = new Fuse(timezones);
        let result = fuse.search(timezone);

        if(!Array.isArray(result) || result?.length < 1) {
            result = [{item: "Europe/London", refIndex: 1}];
        }

        for(let i = 0; i < result.length; i++) {
            result[i] = { name: result[i].item, value: result[i].item };
        }

        await interaction.respond(result.slice(0, 25));
    }
}