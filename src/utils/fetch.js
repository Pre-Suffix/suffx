exports.json = async (url) => {
    let response = await fetch(url);
    let body = await response.json();
    return body;
}
  
exports.raw = async (url) => {
    let response = await fetch(url);
    let body = await response.text();
    return body;
}
