const Discord = require("discord.js");
const crypticModel = require("../../models/crypticModel");
const crypticPastModel = require("../../models/crypticPastModel");
const getPuzzle = require("../../minutecryptic/utils/getPuzzle");
const getResponse = require("../../minutecryptic/utils/getResponse");

/**
 * Handles button interactions on a Music Session's queue.
 * @param { Discord.Client } client 
 * @param { Discord.ButtonInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    if(!interaction.isButton()) return;

    const interactionID = interaction.customId.toString();
    if(!interactionID.startsWith("mc@")) return;
    else if(interactionID.endsWith("@answer")) return;

    const puzzle = await getPuzzle(interaction.user.id);
    if(!puzzle) {
        interaction.update({ embeds: [], components: [], content: "There was an error processing your request." });
        return;
    } else if(puzzle.solved) {
        const responseData = await getResponse(interaction.user.id);
        if(!responseData) {
            interaction.update({
                content: "Something went wrong while processing your request. Try again later.",
                embeds: [], components: []
            });

            return;
        }

        interaction.update({
            content: "",
            embeds: [ responseData.responseEmbed ],
            components: responseData.components,
        });
        return;
    }

    /**
     * Indicators, Fodder, Definition
     * @type { Map<String, Number> }
     */
    let hintIndexes = new Map([
        ["indicators", 0],
        ["fodder"    , 1],
        ["definition", 2]
    ]);

    for(let i = 0; i < puzzle.hints.length; i++) {
        if(puzzle.hints[i].type === "indicators") hintIndexes.set("indicators", i);
        else if(puzzle.hints[i].type === "fodder") hintIndexes.set("fodder", i);
        else if(puzzle.hints[i].type === "definition") hintIndexes.set("definition", i);
    }

    if(hintIndexes.has(interactionID.split('@').pop())) {
        puzzle.hints[hintIndexes.get(interactionID.split('@').pop())].isRevealed = true;
    } else if(interactionID.endsWith("@letter")) {
        puzzle.lettersShown++;
    }

    if(!interactionID.endsWith("@refresh"))
        puzzle.par++;

    if(puzzle.par == puzzle.letterRevealOrder.length + 3 || puzzle.lettersShown == puzzle.letterRevealOrder.length) {
        puzzle.solved = false;
        let docCount = await crypticPastModel.countDocuments({
            userId: interaction.user.id,
            puzzleId: puzzle.puzzleId
        });

        if(docCount == 0)
            await crypticPastModel.create({
                solved: false,
                answer: puzzle.answer,
                letterRevealOrder: puzzle.letterRevealOrder,
                par: puzzle.par,
                puzzleId: puzzle.puzzleId,
                revealedDefinition: puzzle.hints[hintIndexes.get("definition")].isRevealed,
                revealedFodder: puzzle.hints[hintIndexes.get("fodder")].isRevealed,
                revealedIndicators: puzzle.hints[hintIndexes.get("indicators")].isRevealed,
                revealedLetters: puzzle.lettersShown,
                userId: interaction.user.id
            });
    }

    await crypticModel.findOneAndUpdate(
        { userId: interaction.user.id },
        { 
            puzzleDate: puzzle.date,
            puzzleJSON: JSON.stringify(puzzle)         
        }
    );

    const responseData = await getResponse(interaction.user.id);
    if(!responseData) {
        interaction.update({
            content: "Something went wrong while processing your request. Try again later.",
            embeds: [], components: []
        });

        return;
    }

    interaction.update({
        content: "",
        embeds: [ responseData.responseEmbed ],
        components: responseData.components,
    });

}