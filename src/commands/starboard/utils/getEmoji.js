module.exports = (input) => {
    let reg = Array.from(String(input).match(/<a?:.+?:\d{18}>|\p{Emoji}/gu) ?? []);
    if(reg.length == 0) return null;

    if(String(+reg[0]) != "NaN") return reg.slice(0,19).join("");
    else return reg[0].length > 10 ? reg[0].slice(-19, -1) : reg[0];
}