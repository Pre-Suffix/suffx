module.exports = (starboard) => {
    let fields = [
        {
            name: "Channel",
            value: `<#${starboard.channelId}>`,
            inline: true
        }, {
            name: "Min. Stars",
            value: String(starboard.minStars),
            inline: true
        }, {
            name: "Reaction",
            value: starboard.reactionEmoji.emoji,
            inline: true
        }, {
            name: "Visiblity Role",
            value: starboard.visibilityRole == "everyone" ? "@everyone" : `<@&${starboard.visibilityRole}>`
        }
    ];

    if(starboard.emojis.length > 0) {
        let emojis = [];
        starboard.emojis.forEach((e) => 
            emojis.push(`${e.emoji} - ${e.minStars}`)
        );

        fields.push({
            name: "Emojis",
            value: emojis.join("\n"),
            inline: false
        });
    }

    return fields;
}