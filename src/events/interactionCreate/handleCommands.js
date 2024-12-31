const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client, interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(!interaction.inGuild()) {
        interaction.reply({ content: "Support for direct message commands isn't available." });
        return;
    }

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);

        if(!commandObject) return;

        if(commandObject.permissionsRequired?.length) {
            for(const permission of commandObject.permissionsRequired) {
                const bot = interaction.guild.members.me;

                if(!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: "I don't have enough permissions to run this command. Please check if the bot is properly configured.",
                        ephemeral: true
                    });
                    break;
                }
            }
        }

        await commandObject.callback(client, interaction);
        
    } catch (err) {
        console.log(err);
    }
}