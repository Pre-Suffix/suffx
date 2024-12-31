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

    if(myVC && vc.id != myVC.id) interaction.reply({embeds:[errorEmbed("I am already connected to a voice channel.", null)]});
    else if (constructors.has(interaction.guild.id)) interaction.reply({ embeds: [ errorEmbed("The music session has already started.", null) ] });    
    else if(!vc) interaction.reply({embeds:[errorEmbed("You need to be in a voice channel for me to join before executing this command.", "Invalid voice channel")]});
    else {
        try {
            const connection = await connectToChannel(vc);
            let constructor = await constructors.create(interaction.guild.id);

            connection.subscribe(constructor.player);

            constructor["connection"] = connection;
            constructor["voiceChannel"] = vc;
            constructor["textChannel"] = interaction.channel;

            constructors.update(interaction.guild.id, constructor);
            interaction.reply({embeds:[errorEmbed(`Bot has joined <#${vc.id}> and is ready to play music.`, null, process.env.SUFFXCOLOR)]});

        } catch (error) {
            interaction.reply({embeds:[errorEmbed("There was an error while trying to join the voice channel. Try again later.", "Couldn't join")]});
            console.log("join.js: ", error);
        }
    } 
}