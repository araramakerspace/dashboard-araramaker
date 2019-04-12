/*

Main file for the server

Author: Raul Rosá
Created on: Friday, 05/04/2019

Objectives:
	Contains the basic modules and methods for the server to work.

*/


// MODULES AND DEPENDENCIES
const express = require('express')
const app = express();
const router = require('./router');
const bodyParser = require('body-parser');

const port = process.env.PORT || 8000


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Adds static paths to the folders the files will reference
app.use('/img', express.static('img'))
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))

//add the router
app.use('/', router);

app.listen(port, () => console.log(`Server running at Port ${port}`));
