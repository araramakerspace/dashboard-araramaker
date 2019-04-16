/*

RUN THIS FILE BEFORE RUNNING THE SERVER

Author: Raul Rosá
Created on: Tuesday, 16/04/2019

Objectives:
	This file is meant to be used for setting the inicial database configurations, such as tables and relations between them.

	Head to the terminal in this folder, with Node.js installed, and type: node setDatabase.js
	The file will them set your database and make it ready to use.

*/

const sql = require('./db.js');
const fs = require('fs');

fs.readFile('./database/dbScript.sql', 'utf8', function(err, contents){
	if(err) return console.log('Error reading database file');

	fs.writeFile('./araradatabase.db', '', () => {
		console.log('Previous database information erased.');
	})
	fs.readFile('./araradatabase.db', '', (err, contents) => {
		if(err) return console.log('Error reading database info');
		console.log(contents);
	})

	sql.exec(contents);
});