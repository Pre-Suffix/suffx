const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (namesOnly = false) => {
    let commandsList = [];
    const commands = getAllFiles(path.join(__dirname, "..", "commands"));

    commands.forEach((x) => commandsList.push(namesOnly ? require(x).name : require(x)));

    return commandsList;
}