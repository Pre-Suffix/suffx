const { ApplicationCommandOptionType } = require("discord.js");
const random = require("../utils/random");

function alphabetToNumber(letter) {
    let alphabet = "abcdefghijklmnopqrstuvwxyz";
    if(alphabet.includes(letter)) 
        return alphabet.indexOf(letter) + 1;
    
    return 0;
}

function strokeIt(input) {
    var strokedArray = [ "s","v","c","s","w","d","f","g","u","h","j","k","n","b","i","o","w","e","a","r","y","c","q","z","t","x" ]
    var strokedOutput = "";
    var i = 0;
    while(true){
        if(i == input.length) { break; } else {
        var currentLetter = input.substr(i,1);
        if(alphabetToNumber(currentLetter.toLowerCase()) != 0) {
            if(random(1,10) >= 9) {
            strokedOutput = strokedOutput + strokedArray[alphabetToNumber(currentLetter)];
            } else if(random(1,10) <= 2) {
            strokedOutput = strokedOutput + currentLetter + currentLetter;
            } else {
                strokedOutput = strokedOutput + currentLetter;
            }
        } else {
            strokedOutput = strokedOutput + currentLetter;
        }
        i = i + 1;
    }
    }
    return strokedOutput;
}
module.exports = {
    name: "strokeit",
    description: "Strkoe yuor massage! Very fnuuy.",
    options: [
        {
            name: "input",
            description: "Content to stroke.",
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    permissionsRequired: [],

    callback: (client, interaction) => {
        let input = String(interaction.options.getString("input")).replace(/`/g, "'");
        interaction.reply(`Input: \`\`\`${input}\`\`\`\nOutput: \`\`\`${strokeIt(input)}\`\`\``);
    }
}