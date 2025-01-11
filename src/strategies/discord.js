const { Strategy } = require("passport-discord");
const passport = require("passport");
const userModel = require("../models/userModel");

const inDev = process.argv[2] == "--dev";
const clientID = inDev ? process.env.DISCORD_OAUTH_CLIENTID_DEV : process.env.DISCORD_OAUTH_CLIENTID;
const clientSecret = inDev ? process.env.DISCORD_OAUTH_SECRET_DEV : process.env.DISCORD_OAUTH_SECRET;
const callbackURL = inDev ? process.env.DISCORD_OAUTH_REDIRECT_URI_DEV : process.env.DISCORD_OAUTH_REDIRECT_URI;

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        return done(null, user ? user : null);
    } catch (err) {
        console.log("discord.js: ", err);
        return done(err, null);
    }
});

passport.use(new Strategy({
    clientID, clientSecret, callbackURL,
    scope: [ 'identify', 'email', 'guilds' ]
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userModel.findOneAndUpdate({
            userId: profile.id
        }, {
            accessToken, refreshToken
        }, {
            new: true
        });
    
        if(user) return done(null, user);
    
        user = new userModel({
            userId: profile.id,
            accessToken, refreshToken
        });
    
        const savedUser = await user.save();
        return done(null, savedUser);
    } catch (error) {
        console.log("discord.js: ", error);
        return done(error, undefined);
    }
}));