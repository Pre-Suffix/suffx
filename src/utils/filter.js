module.exports = (input) => {
    return input.replace(/~/g, "​~").replace(/´/g, "'").replace(/\*/g, "​*").replace(/_/g, "​_").replace(/\]/g, "]​");
}