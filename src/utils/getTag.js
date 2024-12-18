module.exports = (user) => {
    return user.discriminator == 0 ? user.username : user.tag;
}