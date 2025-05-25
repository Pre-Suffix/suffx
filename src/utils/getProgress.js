/**
 * Simple progress bar maker.
 * @param { Number } percentage 
 * @param { Number } width 
 * @param { String } fillCharacter 
 * @param { String } emptyCharacter 
 * @returns { String }
 */
module.exports = (percentage, width, fillCharacter = "#", emptyCharacter = "-") => {
    return (fillCharacter.repeat(Math.round(percentage * width)) +
        emptyCharacter.repeat(width - Math.round(percentage * width)));
}