const youtubeHandler = require("../../utils/youtubeHandler");

module.exports = async (client, interaction) => {
    if(!interaction.isAutocomplete()) return;

    if(!interaction.inGuild()) {
        interaction.reply({ content: "Support for direct message commands isn't available." });
        return;
    }

    if(interaction.options.getFocused(true).name === "query" && interaction.commandName === "music") { 
        const query = interaction.options.getString("query");
        if(query == '') {
            interaction.respond([{name: "Type something in to get recommendations!", value: "Never Gonna Give You Up"}]);
            return;
        }

        let suggestions = await youtubeHandler.getRecommendations(query);

        if(!Array.isArray(suggestions) || query.length > 100) suggestions = [null, ["Query is too long."] ];
        if(!Array.isArray(suggestions[1])) suggestions = [null, [query]];

        await interaction.respond(
            suggestions[1].map(choice => ({name: choice, value: choice}))
        );
    }
}