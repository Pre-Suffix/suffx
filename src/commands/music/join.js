const Discord = require("discord.js");
const connectToChannel = require("./utils/connectToChannel");
const constructors = require("./utils/constructor");
const errorEmbed = require("../../utils/errorEmbed");

/**
 * 
 * @param { Discord.Client } client 
 * @param { Discord.CommandInteraction } interaction 
 */


module.exports = async (client, interaction) => {
    const vc = interaction.member?.voice.channel;
    const myVC = interaction.guild.members.me?.voice.channel;

    if(myVC && vc.id != myVC.id) {
        interaction.editReply({embeds:[errorEmbed("I am already connected to a voice channel.", null)]});
    } else if(vc) {
        try {
            const connection = await connectToChannel(vc);
            let constructor = constructors.has(interaction.guild.id) ? constructors.get(interaction.guild.id) : await constructors.create(interaction.guild.id);

            connection.subscribe(constructor.player);

            constructor["connection"] = connection;
            constructor["voiceChannel"] = vc;
            constructor["textChannel"] = interaction.channel;

            constructors.update(interaction.guild.id, constructor);
            interaction.editReply({embeds:[errorEmbed(`Bot has joined <#${vc.id}> and is ready to play music.`, null, process.env.SUFFXCOLOR)]});

        } catch (error) {
            interaction.editReply({embeds:[errorEmbed("There was an error while trying to join the VC. Try again later.", "Couldn't join")]});
            console.log("join.js: ", error);
        }
    } else {
        interaction.editReply({embeds:[errorEmbed("You need to be in a voice channel for me to join before executing this command.", "Invalid voice channel")]});
    }
}