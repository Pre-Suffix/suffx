const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const getPuzzle = require("./getPuzzle");
const crypticModel = require("../../models/crypticModel");

/**
 * @typedef { Object } returntype
 * @property { EmbedBuilder } responseEmbed
 * @property { Array<ActionRowBuilder> } components
 */

/**
 * Returns embed and action row elements for a puzzle.
 * @param { String } userid 
 * @returns { returntype }
 */
module.exports = async (userid) => {
    const puzzle = await getPuzzle(userid);
    if(!puzzle) return null;

    let responseEmbed = new EmbedBuilder();
    let buttonRow = new ActionRowBuilder();
    let hintsRow  = new ActionRowBuilder();

    if(puzzle.par == puzzle.letterRevealOrder.length + 3 || puzzle.lettersShown == puzzle.letterRevealOrder.length || puzzle.solved) {
        buttonRow.addComponents(        
            new ButtonBuilder()
            .setCustomId("mc@" + puzzle.date + "@refresh")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🔁")
            .setLabel("Refresh Puzzle")
        );

        let clue = puzzle.clue;

        // Definition: BOLD
        // Fodder:     UNDERLINE
        // Indicators: ITALIC
        for(let i = 0; i < puzzle.hints.length; i++) {
            let hint = puzzle.hints[i];

            hint.highlighting.forEach((v) => {
                let highlighted = puzzle.clue.slice(v[0], v[1]);
                let symb = "*";

                if(hint.type == "definition") symb = "**";
                else if(hint.type == "fodder") symb = "__";

                clue = clue.replace(highlighted, symb + highlighted + symb);
            });

            responseEmbed.addFields({
                name: hint.type.charAt(0).toUpperCase() + hint.type.slice(1),
                value: hint.text
            });
        }

        responseEmbed
        .setTitle("MinuteCryptic " + puzzle.date)
        .setAuthor({ name: "By " + puzzle.setterName })
        .setColor(process.env.SUFFXCOLOR);

        if(puzzle.solved) {
            let solutionText = 
                "Minute Cryptic (" + puzzle.date + ")\n\"" +
                puzzle.clue + "\" (" + puzzle.config.join(", ") + ")\n";

            solutionText += ':white_circle:'.repeat(puzzle.par);
            solutionText += ':purple_circle:'.repeat(puzzle.letterRevealOrder.length + 3 - puzzle.par);
            solutionText += "\nSolved in " + puzzle.par + " hints.\nhttps://www.minutecryptic.com/?utm_source=share";

            responseEmbed.setDescription(
                "# You solved today's puzzle!\n" +
                "Here's the rundown of your solution for you to share:\n```\n" + solutionText + "```\n" +
                "-# Subtitle: *Indicators* • __Fodder__ • **Definition**\n\n" +
                "> " + clue + " • (" + puzzle.config.join(", ") + ")\n" +
                "# Answer: `" + puzzle.answer + "`"
            );
            
        } else {
            responseEmbed.setDescription(
                "## You couldn't solve today's puzzle. Here's the rundown:\n" +
                "-# Subtitle: *Indicators* • __Fodder__ • **Definition**\n\n" +
                "> " + clue + " • (" + puzzle.config.join(", ") + ")\n" +
                "# Answer: `" + puzzle.answer + "`"
            );
        }

        crypticModel.findOneAndUpdate(
            { userId: userid },
            {
                puzzleDate: puzzle.date,
                puzzleJSON: JSON.stringify(puzzle)
            }
        );

        return { responseEmbed, components: [buttonRow] };
    }

    buttonRow.addComponents(
        new ButtonBuilder()
        .setCustomId("mc@" + puzzle.date + "@answer")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅")
        .setLabel("Answer Puzzle"),
        new ButtonBuilder()
        .setCustomId("mc@" + puzzle.date + "@refresh")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔁")
        .setLabel("Refresh Puzzle")
    );

    // Indicators, Fodder, Definition
    let hintIndexes = [0, 1, 2];
    for(let i = 0; i < puzzle.hints.length; i++) {
        if(puzzle.hints[i].type === "indicators") hintIndexes[0] = i;
        else if(puzzle.hints[i].type === "fodder") hintIndexes[1] = i;
        else if(puzzle.hints[i].type === "definition") hintIndexes[2] = i;
    }

    hintsRow.addComponents(
        new ButtonBuilder()
        .setCustomId("mc@" + puzzle.date + "@indicators")
        .setStyle(ButtonStyle.Success)
        .setEmoji("📜")
        .setLabel("Show Indicators")
        .setDisabled(puzzle.hints[hintIndexes[0]].isRevealed),

        new ButtonBuilder()
        .setCustomId("mc@" + puzzle.date + "@fodder")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔤")
        .setLabel("Show Fodder")
        .setDisabled(puzzle.hints[hintIndexes[1]].isRevealed),

        new ButtonBuilder()
        .setCustomId("mc@" + puzzle.date + "@definition")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📖")
        .setLabel("Show Definition")
        .setDisabled(puzzle.hints[hintIndexes[2]].isRevealed),

        new ButtonBuilder()
        .setCustomId("mc@" + puzzle.date + "@letter")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔠")
        .setLabel("Show Letter (" + String(puzzle.letterRevealOrder.length - puzzle.lettersShown) + " left)")
        .setDisabled(puzzle.letterRevealOrder.length == puzzle.lettersShown)
    );

    responseEmbed
    .setTitle("MinuteCryptic " + puzzle.date)
    .setAuthor({ name: "By " + puzzle.setterName })
    .setColor(process.env.SUFFXCOLOR);

    let clue = puzzle.clue;
    let showSubtitle = false;

    // Definition: BOLD
    // Fodder:     UNDERLINE
    // Indicators: ITALIC
    for(let i = 0; i < puzzle.hints.length; i++) {
        let hint = puzzle.hints[i];
        if(!hint.isRevealed) continue;

        showSubtitle = true;

        hint.highlighting.forEach((v) => {
            let highlighted = puzzle.clue.slice(v[0], v[1]);
            let symb = "*";

            if(hint.type == "definition") symb = "**";
            else if(hint.type == "fodder") symb = "__";

            clue = clue.replace(highlighted, symb + highlighted + symb);
        });

        responseEmbed.addFields({
            name: hint.type.charAt(0).toUpperCase() + hint.type.slice(1),
            value: hint.text
        });

    }

    let description = (
        !showSubtitle ? "" :
        "-# Subtitle: *Indicators* • __Fodder__ • **Definition**\n\n"
    ) + "> " + clue + " • (" + puzzle.config.join(", ") + ")";

    if(puzzle.lettersShown > 0) {
        let letters = "\n# Letters: `";
        let shownLetters = puzzle.letterRevealOrder.slice(0, puzzle.lettersShown);
        let config = [ puzzle.config[0] ];

        for(let i = 1; i < puzzle.config.length; i++) config.push( config[i - 1] + puzzle.config[i] );

        for(let i = 0; i < puzzle.letterRevealOrder.length; i++) {
            if(shownLetters.includes(i)) letters += puzzle.puzzlePieces[i].answer;
            else letters += "_"

            if(config.includes(i + 1) && i != puzzle.letterRevealOrder.length - 1)
                letters += "•";
        }

        description += letters + '`';
    }

    responseEmbed.setDescription(description);

    return { responseEmbed, components: [buttonRow, hintsRow] };
}