const fs = require("fs");
const path = require("path");

module.exports = (content, uuid) => {
    let fileContent = JSON.stringify(content);

    fs.writeFileSync(path.join(__dirname, "../..", "chatlogs", uuid + ".json"), fileContent);

    return true;
}