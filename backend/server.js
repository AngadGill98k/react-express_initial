const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3001;

// MongoDB model
const User = require('./models/User.js');
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from React frontend
  credentials: true                // Enable credentials (cookies, sessions)
}));
app.use(cookieParser());
// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/pharma',
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: false
  }
}));
const csrfProtection = csurf({
  cookie: false
});
// Passport setup
app.use(passport.initialize());
app.use(passport.session());
app.use(csrfProtection);
// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'mail',
  passwordField: 'pass'
}, async (mail, pass, done) => {
  try {
  
    const user = await User.findOne({ mail: mail });
    if (!user) return done(null, false, { message: 'User not found' });

    const match = await bcrypt.compare(pass, user.pass);
    if (!match) return done(null, false, { message: 'Incorrect password' });

    return done(null, user._id);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user); // only store ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/pharma')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth middleware
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).send('Unauthorized');
}


app.get('/get_csrf', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
app.post('/signup', async (req, res) => {
  const { name, pass,mail } = req.body;
  const hashedpass = await bcrypt.hash(pass, 10);
  const user = new User({ name, pass: hashedpass,mail });
 
  await user.save();
  res.json({ msg: 'User added' });
});

app.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({ msg: info.message || 'Invalid credentials' }); // always return JSON
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ msg: 'Login successful' });
    });
  })(req, res, next);
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});