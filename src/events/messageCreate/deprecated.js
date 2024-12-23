module.exports = (client, message) => {
    /*
    NON DEPRECATED COMMANDS: 
        roll, wolfram, timer/reminder, ai
    */
    let deprecatedCommands = [
        "logchannel",
        "disablelogging",
        "addlevelrole",
        "levelroles",
        "removelevelrole",
        "rank",
        "leaderboard",
        "ping",
        "version",
        "serverinfo",
        "userinfo",
        "changelog",
        "metar",
        "strokeit",
        "flipacoin",
        "inspireme"
    ];

    let deletedCommands = [
        "brazilfact", 
        "base64", 
        "invite", 
        "giveawayadd", 
        "newpoll", 
        "slowmode", 
        "commandcooldown", 
        "politics", 
        "warn", 
        "warnlog", 
        "removewarning",
        "ban",
        "kick", 
        "mute",
        "unmute",
        "mutelog",
        "purge",
        "prefix",
        "rradd",
        "rrdel",
        "rract",
        "help",
        "tutorial",
        "bal",
        "work",
        "with",
        "invest",
        "gamble",
        "buy",
        "storefront",
        "inv",
        "daily",
        "beg",
        "sell",
        "widenus",
        "dadjoke"
    ]

    if(message.author.bot || !String(message.content).startsWith(".")) return;

    let command = message.content.split(" ")[0].slice(1);

    if(deprecatedCommands.includes(command))
        message.reply({
            content: "This command is no longer available in this format, please use the slash-command equivalent."
        });
    else if(deletedCommands.includes(command))
        message.reply({
            content: "This command has been deleted, and is no longer available. If you found its functionality essential, please find a suitable alternative."
        });

}
