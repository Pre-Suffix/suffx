const fs = require("fs");
const path = require("path");

module.exports = (dir, foldersOnly = false) => {
    let fileList = [];

    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (var i = 0; i < files.length; ++i) {
        const file = files[i];
        const filePath = path.join(dir, file.name);

        if((foldersOnly && file.isDirectory()) | (!foldersOnly && file.isFile()))
            fileList.push(filePath);

    }

    return fileList;
}