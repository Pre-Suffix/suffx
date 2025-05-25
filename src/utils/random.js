/**
 * Simple Math.random() wrapper
 * @param { Number } min 
 * @param { Number } max 
 * @returns { Number }
 */
module.exports = (min, max) => {
    return Math.floor((Math.random())*(max-min+1))+min;
}