const { Router } = require("express");
const { isAuthenticated } = require("../../utils/middleware");
const serverModel = require("../../models/serverModel");
const memberModel = require("../../models/memberModel");
const client = require("../../utils/client");
const { ChannelType } = require("discord.js");

const router = Router();

router.get('/', isAuthenticated, async (req, res) => {
    let r = [];
    const userId = req.user.userId;
    
    let guilds = (await memberModel.find({
        userId, admin: true
    })).map((x) => x.guildId);

    for(let guildId of guilds) {
        const guild = await serverModel.findOne({
            guildId, active: true
        });
        if(guild) r.push(guild);
    }

    res.send(r);
});

router.get("/get", isAuthenticated, async (req, res) => {
    if(String(req.query?.id).length < 18 || String(req.query?.id).length > 19) return res.status(400).send({ error: "Invalid guild ID." });
    const userId = req.user.userId;

    if((await memberModel.find({ userId, admin: true, guildId: req.query.id })).length == 0) return res.status(403).send({ error: "You're not admin of this server." });

    let r = {};

    r["database"] = (await serverModel.findOne({guildId: req.query.id }));

    const Client = client.get();

    try {
        let guild = await Client.guilds.fetch(req.query.id);
        r["discord"] = guild;

        r["channels"] = (await guild.channels.fetch()).map((x) => {return {
            name: x.name, id: x.id, text: x.type == ChannelType.GuildText 
        }});

        r["roles"] = (await guild.roles.fetch()).map((x) => { return { 
            name: x.name, id: x.id, color: x.hexColor, above: x.comparePositionTo(x.guild.members.me.roles.highest) > -1, everyone: x.id == guild.roles.everyone.id 
        }});

        res.send(r);
    } catch (error) {
        console.log(error);
        r["discord"] = undefined;
        res.send(r);
    }

});

router.get("/save/logging", isAuthenticated, async (req, res) => {
    if(String(req.query?.id).length < 18 || String(req.query?.id).length > 19) return res.status(400).send({ error: "Invalid guild ID." });
    const userId = req.user.userId;

    if((await memberModel.find({ userId, admin: true, guildId: req.query.id })).length == 0) return res.status(403).send({ error: "You're not admin of this server." });

    const guildId = req.query.id;
    const active = req.query.active;
    const channelId = req.query.channelId;
    const messageEdit = req.query.messageEdit;
    const messageDelete = req.query.messageDelete;

    if(!guildId || !active || !channelId || !messageEdit || !messageDelete) return res.status(400).send({ error: "Not all fields filled." });

    await serverModel.findOneAndUpdate({ guildId }, { logging: { 
        active: active == "true", 
        messageEdit: messageEdit == "true", 
        messageDelete: messageDelete == "true",
        channelId
    } });

    console.log(guildId, active, channelId, messageEdit, messageDelete);

    res.status(200).send({ msg: "Update successful." });
});

router.get("/save/autorole", isAuthenticated, async (req, res) => {
    if(String(req.query?.id).length < 18 || String(req.query?.id).length > 19) return res.status(400).send({ error: "Invalid guild ID." });
    const userId = req.user.userId;

    if((await memberModel.find({ userId, admin: true, guildId: req.query.id })).length == 0) return res.status(403).send({ error: "You're not admin of this server." });

    const guildId = req.query.id;
    const roleId = req.query.roleId;
    const add = req.query.add === "true";

    if(!guildId || !roleId || !req.query.add) return res.status(400).send({ error: "Not all fields filled. "});

    let guild = await serverModel.findOne({ guildId });

    if(add)
        guild.autoRoles.push(roleId);
    else {
        let roles = [];
        guild.autoRoles.forEach((r) => { if(r != roleId) roles.push(r); });

        guild.autoRoles = roles;
    }

    await guild.save();

    res.status(200).send({ msg: "Update successful. " });
});

router.get("/save/rolekeep", isAuthenticated, async (req, res) => {
    if(String(req.query?.id).length < 18 || String(req.query?.id).length > 19) return res.status(400).send({ error: "Invalid guild ID." });
    const userId = req.user.userId;

    if((await memberModel.find({ userId, admin: true, guildId: req.query.id })).length == 0) return res.status(403).send({ error: "You're not admin of this server." });

    const guildId = req.query.id;
    const active = req.query.active === "true";

    if(!guildId || !req.query.active) return res.status(400).send({ error: "Not all fields filled. "});

    await serverModel.findOneAndUpdate({ guildId }, {
        keepRoles: active
    });

    res.status(200).send({ msg: "Update successful. " });
});

router.get("/save/levelrole", isAuthenticated, async (req, res) => {
    if(String(req.query?.id).length < 18 || String(req.query?.id).length > 19) return res.status(400).send({ error: "Invalid guild ID." });
    const userId = req.user.userId;

    if((await memberModel.find({ userId, admin: true, guildId: req.query.id })).length == 0) return res.status(403).send({ error: "You're not admin of this server." });

    const guildId = req.query.id;
    const roleId = req.query.roleId;
    const add = req.query.add === "true";
    const level = req.query.level;

    if(!guildId || !req.query.add || !roleId) return res.status(400).send({ error: "Not all fields filled. "});

    let guild = await serverModel.findOne({ guildId });

    if(add && !!level && !guild.levelRoles.find((x) => x.level == level))
        guild.levelRoles.push({
            level, roleId
        });
    else if(!add && guild.levelRoles.find((x) => x.roleId == roleId)) {
        let levelRoles = [];

        guild.levelRoles.forEach((x) => { if(x.roleId != roleId) levelRoles.push(x); });

        guild.levelRoles = levelRoles;
    }

    await guild.save();

    res.status(200).send({ msg: "Settings saved." });

});

module.exports = router;