const Express = require("express");
const session = require("express-session");
const store = require("connect-mongo");
const passport = require("passport")
const cors = require("cors");

module.exports = (mongoUrl) => {
    require("../strategies/discord.js");

    const app = Express();

    app.use(Express.json());
    app.use(Express.urlencoded({ extended: true }));

    app.use(cors({ origin: ['http://localhost:8088'], credentials: true }));

    app.use(session({
        secret: process.env.API_SECRET, 
        resave: false, 
        saveUninitialized: false,
        cookie: {
            maxAge: 60000 * 60 * 24 * 30,
            domain: (new URL(process.env.DASHBOARD_URL)).host
        },
        store: store.create({
            mongoUrl
        }),
        proxy: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.listen(process.env.API_PORT, () => {
        console.log(`• API Listening on port ${process.env.API_PORT}`);
        app.use('/', require("../routes/routes.js")());
    });

}