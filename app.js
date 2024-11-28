// environment vars
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-limit'); // middleware to limit login attempts
const helmet = require('helmet'); // middleware to secure http headers

const bcrypt = require('bcryptjs'); // password hashing library
const session = require('express-session');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(helmet());

// setup session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Secret used to sign the session ID cookie
    resave: false, // Prevents saving session if it wasn't modified
    saveUninitialized: false, // Prevents creating a session until something is stored
    cookie: { secure: false, httpOnly: true } // set secure true if https
  }));


// Middleware to verify if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.username) { // Check if the session contains a logged-in username
      req.username = req.session.username; // Attach username to request for further use
      return next(); // Proceed to the next middleware or route handler
    }
    res.status(401).send('Unauthorized. Please log in first.'); // If not authenticated, send an unauthorized response
  }







//Hardcoded users with hashed passwords, generated with the following script 
/* 
bcrypt.hash('password1', 10, (err, hash) => {
    if (err) throw err;
    console.log(hash);
    });

    */

pass2 = 'password2';
bcrypt.hash(pass2, 10, (err, hash) => {
    if (err) throw err;
    console.log(hash);
    });

    
// rate limiter middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const port = process.env.PORT || 3000;

const users = {
    "user1" : '$2a$10$.tbGVSwcBR3uPHQCUsSTSe9PBv9WRF2IcIOhs2lCwaq9xEPHuyXda',
    "user2" : '$2a$10$/pRZATyxqhdxmfMTowg4XecMYHqjCVVXdZPnV6jYvC4UfZXM871dO'
}

const loggedUsers = new Set();

app.get('/', (req, res) => {
    res.send('Hello, PL3!');
});


app.post('/login', limiter, async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        if(!users[username]) {
            res.status(401).send('Invalid credentials 1');
            return;
        }
        const match = await bcrypt.compare(password, users[username]);
        if (!match) {
            res.status(401).send('Invalid credentials 2');
            return;
        }
        req.session.username = username;
        res.status(200).send('Login successful');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});


app.get('/protected', isAuthenticated, (req, res) => {
    const username = req.username;
    res.send(`Hello, ${username} are logged in.`);
});

app.get('/logout', isAuthenticated, (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to log out. Please try again.'); // Handle error during session destruction
        }
        res.send('Logout successful!'); // Send confirmation of logout
      });
    });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

