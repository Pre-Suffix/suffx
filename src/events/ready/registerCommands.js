const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client) => {
    const localCommands = getLocalCommands();

    console.log("(3/4) Registering commands.")

    try {
        const registeredCommands = await client.application.commands.fetch();
        const commandsName = getLocalCommands(true);

        registeredCommands.forEach(async (x) => {
            if(!commandsName.includes(x.name)) {
                console.log(`Deleting old command ${x.name}`);
                await client.application.commands.delete(x.id);
            }
        });

        localCommands.forEach(async (x) => {
            let name = x.name;
            let description = x.description;
            let options = typeof x.options === "undefined" ? [] : x.options;

            console.log(`Registering command: ${x.name}`);

            await client.application.commands.create({
                name,
                description,
                options
            });
        })


    } catch (err) {
        console.log(`registerCommands.js: ${err}`);
    }

}