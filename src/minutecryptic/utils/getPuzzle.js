const crypticModel = require("../../models/crypticModel");
const moment = require("moment-timezone");
const fetch = require("../../utils/fetch");
let puzzles = new Map();

/**
 * @typedef { Object } piece
 * @property { String } answer
 * @property { Boolean } isRevealed
 * @property { String } input
 */

/**
 * @typedef { Object } hint
 * @property { String } text
 * @property { "indicators" | "fodder" | "definition" } type
 * @property { "pink" | "yellow" | "blue" } colour
 * @property { Array<Array<Number>> } highlighting
 * @property { Boolean } isRevealed
 */

/**
 * @typedef { Object } pardetails
 * @property { Number } averagePar
 * @property { Number } solveCount
 */

/**
 * @typedef { Object } crypticPuzzle
 * @property { String } puzzleId
 * @property { Array<Number> } letterRevealOrder,
 * @property { String } clue
 * @property { String } answer
 * @property { Array<piece> } puzzlePieces
 * @property { Array<Number> } config
 * @property { Number } par 
 * @property { String } explainerVideo
 * @property { String } date
 * @property { String } setThumbnail
 * @property { String } setterName
 * @property { Array<hint> } hints
 * @property { pardetails } parDetails
 * @property { Number } lettersShown
 * @property { Boolean } solved
 */


/**
 * Retrieves the puzzle from the MinuteCryptic API or a local cache if available.
 * @param { String } userid 
 * @returns { crypticPuzzle | false | undefined }
 */
const getPuzzle = async (userid) => {
    let user = await crypticModel.findOne({ userId: userid });
    if(!user) return false;

    const date = moment().tz(user.timezone).format("YYYY-MM-DD");
    if(user?.puzzleDate == date) return JSON.parse(user.puzzleJSON);

    if(!puzzles.has(date)) {
        let puzzle = await fetch.json(`https://www.minutecryptic.com/api/daily_puzzle/today?tz=${user.timezone}`);

        if(!!puzzle) {
            let pieces = new Array();
            for(let i = 0; i < puzzle.letterRevealOrder.length; i++)
                pieces.push(puzzle.puzzlePieces[String(i)]);

            puzzle.puzzlePieces = pieces;
            
            for(let i = 0; i < puzzle.hints.length; i++)
                puzzle.hints[i].isRevealed = false;

            puzzle.lettersShown = 0;

            let clue = [];
            for(let i = 0; i < puzzle.clue.length; i++)
                clue.push(puzzle.clue[i].text);

            puzzle.clue = clue.join(' ');
            puzzle.par = 0;
            puzzle.solved = false;

            puzzles.set(date, puzzle);

            user.puzzleJSON = JSON.stringify(puzzle);
            user.puzzleDate = date;

            await user.save();

            return puzzle;
        }

        return undefined;
    }

    user.puzzleJSON = JSON.stringify(puzzles.get(date));
    user.puzzleDate = date;

    await user.save();

    return puzzles.get(date);
}

module.exports = getPuzzle;