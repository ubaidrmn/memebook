const pug = require('pug');
const express = require('express');
const router = express.Router();
const { generate_jwt } = require('../functions/auth.js');
const { User } = require('../mysql-models/user.js');
const { Meme } = require('../mysql-models/meme.js');
const { Vote } = require('../mysql-models/vote.js');
const { db } = require('../mysql-models/config.js');
const { Comment } = require('../mysql-models/comment.js');

router.post("/post-comment", async (req,res) => {
    const username = req.authStatus.user_data.username
    const user = await User.findOne({where:{
        Username:username
    }})
    const memeId = req.body.memeId
    const comment = req.body.comment
    await Comment.create({UserId:user.id,Comment:comment,MemeId:memeId})
    res.redirect("/meme/"+memeId)
})

router.get("/", async (req,res)=>{
    let homeQuery = `SELECT e.id,UserId,Link,Caption,Funny,Unfunny,Username FROM 
    (SELECT * FROM Memes m LEFT JOIN (SELECT MemeId,COUNT(*) AS Funny FROM Votes WHERE Type='funny' GROUP BY Type, MemeId)
    b on m.id=b.MemeId LEFT JOIN (SELECT MemeId as MemeIdU,COUNT(*) AS Unfunny FROM Votes WHERE Type='unfunny' GROUP BY Type, MemeId) 
    c on m.id=c.MemeIdU) e INNER JOIN Users u on e.UserId = u.id ORDER BY Funny DESC`

    const searchData = {
        search:false,
        query:null,
    }

    if (req.query.q != undefined) {
        searchData.search = true;
        searchData.query = req.query.q
        homeQuery = `SELECT * FROM (${homeQuery}) q WHERE q.Caption LIKE '%${req.query.q}%'`;
    }

    const [memes, metadata] = await db.query(homeQuery)
    console.log(memes)
    res.send(pug.renderFile('views/home-page.pug', {
        authStatus:req.authStatus,
        memes:memes,
        search:searchData,
        title:"Memebook - Home"
    }))

})

router.get("/rate-meme", async (req,res) => {
    const memeId = req.query.meme
    const found = req.query.found
    const user = await User.findOne({where:{username:req.authStatus.user_data.username}})
    const votes = await Vote.findAll({where:{
        UserId:user.id, MemeId:memeId
    }})
    let type = null;
    
    if (found == "funny") {type="funny";}
    else if (found == "unfunny") {type="unfunny";}

    console.log(found)

    if (votes.length == 0) {
        if (type != null) {
            await Vote.create({MemeId:memeId,UserId:user.id,Type:type})
        }
    } else {
        if (type != null) {
            await Vote.update({Type:type}, {where:{
                UserId:user.id,
                MemeId:memeId
            }})
        }
    }

    let url = "/"
    if (req.query.redirect == "view") {
        url = "/meme/"+memeId
    }
    res.redirect(url)
})

router.get("/account/:username", async (req,res)=>{

    let account_data = {
        owner:false,
        exists:true,
        data:null,
        memes:null
    }
    const username = req.params.username

    const user = await User.findAll({where:{
        Username:username
    }})

    if (user.length == 0) {
        account_data.exists = false
    } else {
        account_data.data = user[0]
        const memes = await Meme.findAll({
            where:{
                UserId:user[0].id
            }
        })
        account_data.memes = memes
        const [total_memes,metadata] = await db.query(`SELECT COUNT(*) AS Total FROM Memes WHERE UserId=${user[0].id} GROUP BY UserId`)
        if (total_memes.length != 0) {
            account_data.total_memes = total_memes[0]
        } else {
            account_data.total_memes = {Total:0}
        }
    }

    if (req.authStatus.logged_in) {
        if (username == req.authStatus.user_data.username) {
            account_data.owner = true
        }
    }

    res.send(pug.renderFile('views/account-page.pug', {
        authStatus:req.authStatus,
        account:account_data,
        title:"Memebook - " + username
    }))
})

router.get("/meme/:id", async (req,res)=>{
    let [meme, metadata] = await db.query(`SELECT * FROM (SELECT e.id,UserId,Link,Caption,Funny,Unfunny,Username FROM 
        (SELECT * FROM Memes m LEFT JOIN (SELECT MemeId,COUNT(*) AS Funny FROM Votes WHERE Type='funny' GROUP BY Type, MemeId)
        b on m.id=b.MemeId LEFT JOIN (SELECT MemeId as MemeIdU,COUNT(*) AS Unfunny FROM Votes WHERE Type='unfunny' GROUP BY Type, MemeId) 
        c on m.id=c.MemeIdU) e INNER JOIN Users u on e.UserId = u.id) a WHERE a.id=${req.params.id};`)
    meme = meme[0]
    
    const user = await User.findOne({where:{id:meme.UserId}})

    const [comments, metadata2] = await db.query(`SELECT c.UserId,c.Comment,u.Username FROM Comments c INNER JOIN Users u on c.UserId=u.id WHERE c.MemeId=${meme.id};`);

    res.send(pug.renderFile('views/view-meme-page.pug', {
        authStatus:req.authStatus,
        title:"Memebook - " + meme.Caption,
        data:{
            meme:meme,
            user:user,
            comments:comments,
        }
    }))
})

router.get("/settings", (req,res)=>{
    res.send(pug.renderFile('views/settings-page.pug', {
        authStatus:req.authStatus,
        title:"Memebook - Settings",
    }))
})

router.get("/login", (req,res)=>{
    res.send(pug.renderFile('views/login-page.pug', {
        authStatus:req.authStatus,
        title:"Memebook - Login",
    }))
})

router.get("/register", (req,res)=>{
    res.send(pug.renderFile('views/register-page.pug', {
        authStatus:req.authStatus,
        title:"Memebook - Register",
    }))
})

router.get("/add-meme", (req,res)=>{
    res.send(pug.renderFile('views/add-meme-page.pug', {
        authStatus:req.authStatus,
        title:"Memebook - Add Meme",
    }))
})

router.post('/add-meme-action', async (req, res) => {
    try {
        if(!req.files) {
            res.redirect("/add-meme?err=post_upload_failed")
        } else {
            let avatar = req.files.file;
            const file_name = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + avatar.name;
            avatar.mv('./public/static/memes/' + file_name);
            const username = req.authStatus.user_data.username
            const user = await User.findOne({where:{
                Username:username
            }})
            const link = '/static/memes/'+file_name
            const caption = req.body.caption
            await Meme.create({UserId:user.id,Link:link,Caption:caption})
            res.redirect("/")
        }
    } catch (err) {
        console.log(err)
        res.redirect("/add-meme?err=post_upload_failed")
    }
});

router.get("/logout-user", (req,res)=>{
    res.cookie('request-token', '');
    res.redirect("/")
})

router.post("/login-user", async (req,res)=>{
    try {
        const username = req.body.username;
        const password = req.body.password;
        
        if (username == undefined || password == undefined || username == "" || password == "") {
            res.redirect("/login?err=invalid_data")
        } else {
            const data = await User.findAll({where:{
                Username:username,
                Password:password
            }})
            if (data.length == 0) {
                res.redirect("/login?err=user_not_found")
            } else {
                const token = generate_jwt({username: username})
                res.cookie('request-token', token);
                res.redirect("/")
            }
        }

    } catch (err) {
        res.redirect("/login?err=invalid_data")
    }
})

router.post("/register-user", async (req,res)=>{
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        
        if (username == undefined || email == undefined || password == undefined || username == "" || password == "" || email == "") {
            console.log(username,email,password)
            res.redirect("/register?err=invalid_data")
        } else {
            const check_username = await User.findAll({where:{Username:username}})
            const check_email = await User.findAll({where: {Email:email}})
            if (check_email.length >= 1 || check_username.length >= 1) {
                res.redirect("/register?err=username_or_email_taken")
            } else {
                const user = await User.create({Username:username,Email:email,Password:password})
                const token = generate_jwt({username: username})
                res.cookie('request-token', token);
                res.redirect("/")
            }
        }

    } catch (err) {
        console.log(err)
        res.redirect("/register?err=invalid_data")
    }
})

module.exports = router
