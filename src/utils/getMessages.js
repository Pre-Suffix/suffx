const fs = require("fs");
const path = require("path");

module.exports = (uuid) => {
    let exists = fs.existsSync(path.join(__dirname, "../..", "chatlogs", uuid + ".json"));

    if(exists) {
        let file = fs.readFileSync(path.join(__dirname, "../..", "chatlogs", uuid + ".json"));

        return JSON.parse(String(file));
    }

    return undefined;
}