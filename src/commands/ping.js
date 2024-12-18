module.exports = {
    name: "ping",
    description: "Ping! Pong?",
    permissionsRequired: [],

    callback: (client, interaction) => {
        interaction.reply(`Pong! ${client.ws.ping}ms`);
    }
}