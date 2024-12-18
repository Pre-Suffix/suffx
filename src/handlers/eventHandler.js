const getAllFiles = require("../utils/getAllFiles")
const path = require("path");

module.exports = (client) => {
    const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

    for(let i = 0; i < eventFolders.length; ++i) {
        let eventFolder = eventFolders[i];
        let eventFiles = getAllFiles(eventFolder);
        let eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

        client.on(eventName, async (arg, arg2) => {
            for (const eventFile of eventFiles) {
                const eventFunction = require(eventFile);
                await eventFunction(client, arg, arg2);
            }
        })
    }

}