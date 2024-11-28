// environment vars
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-limit'); // middleware to limit login attempts
const helmet = require('helmet'); // middleware to secure http headers

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(helmet());

// rate limiter middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const port = process.env.PORT || 3000;

const users = {
    user1 : 'password1',
    user2 : 'password2'
}

const loggedUsers = new Set();

app.get('/', (req, res) => {
    res.send('Hello, PL3!');
});

app.post('/login', limiter, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // const { username, password } = req.body;
    if(users[username] === password) {
        res.cookie('username', username ,{httpOnly: true, secure: true});
        res.status(200).send('Login successful');
        loggedUsers.add(username);
        console.log(`User ${username} logged in`);
        console.log(`logged users : ${loggedUsers}`);
        console.log(loggedUsers);
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.get('/protected', (req, res) => {
    const username = req.cookies.username;
    if(loggedUsers.has(username)) {
        res.send(`Hello, ${username} are logged in.`);
    } else {
        res.status(401).send('Unauthorized');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

