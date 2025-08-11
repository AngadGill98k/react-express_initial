const express=require("express");
const path=require("path");
const app=express();
const PORT=3001


app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));


const bcrypt=require("bcrypt");
const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/testing")
    .then(()=>{
        console.log("db connected");
    })
    .catch((err)=>{
        console.log(err);
    })
let User=require("./models/User");


const MongoStore=require("connect-mongo");
const cookieparser=require("cookie-parser");
app.use(cookieparser());


const session=require("express-session");
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({mongoUrl:"mongodb://127.0.0.1:27017/testing"}),
    cookie:{
        maxAge:24*60*60*1000,
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    }
}));


const cors=require("cors");
const csurf=require("csurf");
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}));
app.use(csurf());








const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy; 
passport.serializeUser((user,done)=>{
    done(null,user._id);
})
passport.deserializeUser(async (id,done)=>{
    let user=await User.findById(id)        
    done(null,user);  
})
passport.use(new LocalStrategy({
    usernameField:"mail",
    passwordField:"pass"
},async (mail,pass,done)=>{
    let user=await User.findOne({mail});
    let hashedpass= await  bcrypt.compare(pass,user.pass);
    if(!user){
        return done(null,false,{message:"Invalid credentials"});
    }
    if(!hashedpass){
        console.log(user.pass);
        return done(null,false,{message:"Invalid credentials"});
    }
    return done(null,user);
}))


app.use(passport.initialize());
app.use(passport.session());


const multer=require("multer");
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads");
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now()+file.originalname);
    }
})
const upload=multer({storage:storage});


app.use('/uploads', express.static('uploads'));






app.get('/get_csrf', (req, res) => {
  const token = req.csrfToken();
  res.json({ csrfToken: token }); 
});

app.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({ msg: info.message || 'Invalid credentials' }); // always return JSON
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: 'Login successful' });
    });
  })(req, res, next);
});

app.post('/signup', async (req, res) => {
  try {
    const { name,pass,mail } = req.body;
    const hashedpass = await bcrypt.hash(pass, 10);
    const user = new User({ name,pass:hashedpass,mail });
    await user.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ error: err.message,msg:false }); 
  }
});

app.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send('Logout error');
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.send('Logged out');
    });
  });
});



app.listen(3001,()=>{
    console.log("server started");
})