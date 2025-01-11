const Express = require("express");
const getAllFiles = require("../utils/getAllFiles");
const path = require("path");

/**
 * 
 * @returns { Express.Router }
 */

module.exports = () => {
    const router = Express.Router();
    let folders = getAllFiles(path.join(__dirname), true);

    for(var folder of folders) {
        const routeName = folder.split("\\").pop();

        router.use("/" + routeName, require(path.join(folder, routeName + ".js")));
    }

    router.get("/", (req, res) => res.send({ error: "Undefined API end point. Available end points: " + folders.map((x) => x.split("\\").pop()).join(", ") }));

    return router;
    
};