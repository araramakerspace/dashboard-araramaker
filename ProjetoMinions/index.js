/*

Main file for the server

Author: Raul Rosá
Created on: Friday, 05/04/2019

Objectives:
	Contains the basic modules and methods for the server to work.

*/

// MODULES AND DEPENDENCIES
const express = require('express')
const path = require('path');
const app = express();
const router = require('./router');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const port = process.env.PORT || 8000


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'O grupo arara maker é do caramba (frase family-friendly)', resave: true, saveUninitialized: false }));

//Adds static paths to the folders the files will reference
app.use('/img', express.static('img'))
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))

//add the router
app.use('/', router);

app.use(function(req, res, next) {
  return res.status(404).sendFile(path.join(__dirname+'/error.html'));
});

app.listen(port, () => console.log(`Server running at Port ${port}`));
