'use strict';

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const auth = require('./app/auth.js');
const routes = require('./app/routes.js');
const mongo = require('mongodb').MongoClient;
const passport = require('passport');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').Server(app);
const sessionStore = new session.MemoryStore();
const cors = require('cors');

/* Make sure to add the following variables to your .env file!

SESSION_SECRET=(random number)
DATABASE=(your database url)
GITHUB_CLIENT_ID=(authorize this app with github and get these two variables)
GITHUB_CLIENT_SECRET=(authorize this app with github and get these two variables)

*/

// Documentation for mongodb here
// http://mongodb.github.io/node-mongodb-native/3.2/api/

// Do not put this under fccTesting(app)
// otherwise your tests won't pass
app.use(cors());

fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		key: 'express.sid',
		store: sessionStore,
	})
);

mongo.connect(process.env.DATABASE, (err, client) => {
	if (err) console.log('Database error: ' + err);
	// Since mongodb v3, the callback function was changed from (err, db)
	// to (err, client) and your database is in client.db
	const db = client.db('chat');
	// Input your database name above
	auth(app, db);
	routes(app, db);

	http.listen(process.env.PORT || 3000);

	//start socket.io code
	io.on('connection', (socket) => {
		console.log('A user has connected');
	});
	//end socket.io code
});
