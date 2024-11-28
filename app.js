// environment vars
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const port = process.env.PORT || 3000;

const users = {
    user1 : 'password1',
    user2 : 'password2'
}

const loggedUsers = new Set();

app.get('/', (req, res) => {
    res.send('Hello, PL1!');
});

app.post('/login', (req, res) => {
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

