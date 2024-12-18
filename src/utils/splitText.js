module.exports = (text, limit = 4096) => {
    let input = text.split("\n");
    let output = [];
    let chunk = "";
    while(input.length != 0) {
        if((chunk + input[0]).length <= (limit - 4)) chunk += "\n" + input.shift();
        else {
            output.push(chunk);
            chunk = input.shift();
        }
    }

    if(output != []) output.push(chunk);

    return output;
}