const { Router } = require("express");
const { isAuthenticated } = require("../../utils/middleware");
const chatModel = require("../../models/chatModel");
const getMessages = require("../../utils/getMessages");
const client = require("../../utils/client");

const router = Router();

router.get('/list', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    let chats = (await chatModel.find({
        userId
    }))
    .sort((a, b) => b.active - a.active)
    .map((x) => {
        const message = getMessages(x.uuid);

        return {
            uuid: x.uuid,
            active: x.active,
            ended: x.ended,
            created: message?.created ?? 0,
            lastMessage: message?.messages[message.messages.length - 2].content ?? ""
        };
    });

    res.send(chats);
});

router.get('/get', isAuthenticated, async (req, res) => {
    if(String(req.query?.uuid).length != 36) return res.status(400).send({ error: "Invalid UUID supplied." });
    const userId = req.user.userId;
    let chat = getMessages(req.query.uuid);

    if(chat == undefined) return res.status(400).send({ error: "Invalid UUID specified." });
    else if(chat.userId != userId) return res.status(403).send({ error: "UUID given is chat from a different user." });

    const Client = client.get();

    try {
        const iconURL = (await Client.users.fetch(chat.userId)).avatarURL();

        chat["userIconURL"] = iconURL;
        res.send(chat);
    } catch (error) {
        chat["userIconURL"] = "/undefined.jpg";
        res.send(chat);
    } 

});

module.exports = router;