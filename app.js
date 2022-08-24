const express = require('express')
const app = express()
const port = 8080
const router = require('./routes/routes');
const { verify_jwt } = require('./functions/auth');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req,res,next) => {

  const protected_pages = ["post-comment","add-meme", "add-meme-action", "logout-user", "settings", "rate-meme"]
  const protected_pages_from_logged_in = ["login", "register"]
  const verification = verify_jwt(req.cookies['request-token']);
  let stop_request = false;
  if (verification.verified) {
    req.authStatus = {
      logged_in:true,
      user_data:verification.data.data
    }

    protected_pages_from_logged_in.forEach(page=>{
      if (req.path.search(page) !== -1) {
        res.redirect("/")
      }
    })

  } else {
    req.authStatus = {
      logged_in:false,
      user_data:{
        username:"null",
      }
    }
    protected_pages.forEach(page=>{
      if (req.path.search(page) !== -1) {
        res.redirect("/login")
        console.log("YEAHHH")
        stop_request = true;
      }
    })
  }

  if (!stop_request) {
    next()
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true
}));
app.use(cookieParser());
app.use(authMiddleware);
app.use(express.static('public'));
app.use('/', router);
app.listen(port, () => {});
