module.exports = {
    name: "flipacoin",
    description: "Flips you a virtual coin.",
    options: [],
    permissionsRequired: [],

    callback: (client, interaction) => {
        let r = Math.random();

        if(r < 0.5) interaction.reply("You flipped tails.");
        else if(r == 0.5) interaction.reply("Your coin landed on its side (????)");
        else interaction.reply("You flipped heads.");
    }
}