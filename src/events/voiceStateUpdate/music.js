const constructors = require("../../commands/music/utils/constructor");

module.exports = (client, oldState, newState) => {
    if(oldState.channel && !newState.channel && oldState.member.id == client.user.id && constructors.has(oldState.guild.id))
        constructors.delete(oldState.guild.id);

    if(oldState.channel && newState.channel && oldState.member.id == client.user.id && constructors.has(oldState.guild.id)) {
        let constructor = constructors.get(oldState.guild.id);

        constructor.voiceChannel = newState.channel;

        constructors.update(oldState.guild.id, constructor);
    }
}