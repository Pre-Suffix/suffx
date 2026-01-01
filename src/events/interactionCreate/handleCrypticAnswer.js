const Discord = require("discord.js");
const crypticModel = require("../../models/crypticModel");
const crypticPastModel = require("../../models/crypticPastModel");
const getPuzzle = require("../../minutecryptic/utils/getPuzzle");
const getResponse = require("../../minutecryptic/utils/getResponse");

/**
 * Handles button interactions on a Music Session's queue.
 * @param { Discord.Client } client 
 * @param { Discord.ModalSubmitInteraction } interaction 
 */
module.exports = async (client, interaction) => {
    if(!interaction.isModalSubmit()) return;

    const interactionID = interaction.customId.toString();
    if(!interactionID.startsWith("mc@") && !interactionID.endsWith("@modal")) return;

    const date = interactionID.split('@')[1];
    const puzzle = await getPuzzle(interaction.user.id);

    if(!puzzle) {
        interaction.reply({
            content: "There was a problem processing your request. Try again later.",
            flags: "Ephemeral"
        });
        return;
    } else if(puzzle.date != date) {
        interaction.reply({
            content: "You're trying to answer for last day's puzzle! Refresh the puzzle and try again.",
            flags: "Ephemeral"
        });
        return;
    } else if(puzzle.solved) {
        interaction.reply({
            content: "You've already solved the puzzle!",
            flags: "Ephemeral"
        });
        return;
    } else if(puzzle.par == puzzle.letterRevealOrder.length + 3 || puzzle.lettersShown == puzzle.letterRevealOrder.length) {
        interaction.reply({
            content: "You have already lost this puzzle.",
            flags: "Ephemeral"
        });
        return;
    }

    let docCount = await crypticPastModel.countDocuments({
        userId: interaction.user.id,
        puzzleId: puzzle.puzzleId
    });
    
    if(docCount != 0) {
        interaction.reply({
            content: "You've already solved the puzzle!",
            flags: "Ephemeral"
        });
        return;
    }

    let userAnswer = interaction.fields.getTextInputValue("answer").replace(/[^a-zA-Z]+/g, '').toUpperCase();
    let answer = puzzle.answer.replace(/[^a-zA-Z]+/g, '').toUpperCase();

    if(userAnswer.length != answer.length) {
        interaction.reply({
            content: "Your answer is too " + 
            (userAnswer.length > answer.length ? "long" : "short") +
            "! It should have exactly " + answer.length + " letters.",
            flags: "Ephemeral"
        });
        return;
    }

    userAnswer = userAnswer.split('');
    for(let i = 0; i < puzzle.lettersShown; i++) {
        userAnswer[puzzle.letterRevealOrder[i]] = answer.charAt(puzzle.letterRevealOrder[i]);
    }
    userAnswer = userAnswer.join('');

    if(userAnswer != answer) {
        interaction.reply({
            content: "That answer is incorrect! Try again.",
            flags: "Ephemeral"
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

    puzzle.solved = true;
    await crypticModel.findOneAndUpdate({ userId: interaction.user.id }, {
        puzzleDate: date,
        puzzleJSON: JSON.stringify(puzzle)
    });

    await crypticPastModel.create({
        solved: true,
        answer: answer,
        letterRevealOrder: puzzle.letterRevealOrder,
        par: puzzle.par,
        puzzleId: puzzle.puzzleId,
        revealedDefinition: puzzle.hints[hintIndexes.get("definition")].isRevealed,
        revealedFodder: puzzle.hints[hintIndexes.get("fodder")].isRevealed,
        revealedIndicators: puzzle.hints[hintIndexes.get("indicators")].isRevealed,
        revealedLetters: puzzle.lettersShown,
        userId: interaction.user.id
    });

    const responseData = await getResponse(interaction.user.id);
    if(!responseData) {
        interaction.reply({
            content: "Something went wrong while processing your request. Try again later.",
            flags: "Ephemeral"
        });

        return;
    }

    interaction.update({
        content: "",
        embeds: [ responseData.responseEmbed ],
        components: responseData.components,
    });

}