const { Router } = require("express");
const { isAuthenticated } = require("../../utils/middleware");
const timerModel = require("../../models/timerModel");

const router = Router();

router.get('/', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const timers = (await timerModel.find({
        userId
    })).sort((a, b) => a.setoffTS - b.setoffTS);

    res.send(timers);
});

module.exports = router;