const { Router } = require("express");
const passport = require("passport");

const router = Router();

router.get('/discord', passport.authenticate('discord'), (req, res) => {
    res.sendStatus(200);
});

router.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
    res.redirect(process.env.DASHBOARD_URL);
});

router.get('/status', (req, res) => {
    return req.user ? res.send(req.user) : res.send({ error: "You aren't authenticated." });
});

module.exports = router;