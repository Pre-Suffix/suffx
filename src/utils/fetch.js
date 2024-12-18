const f = require("node-fetch");

exports.json = async (url) => {
    let response = await f(url);
    let body = await response.json();
    return body;
}
  
exports.raw = async (url) => {
    let response = await f(url);
    let body = await response.text();
    return body;
}
  

