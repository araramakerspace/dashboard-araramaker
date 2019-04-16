/*

File containg the database methods

Author: Raul Rosá
Created on: Tuesday, 16/04/2019

Objectives:
	In this file are the methods to get, post, put and delete data from the database.

*/

//Path to the database
const dbPath = 'araradatabase.db';

const Conn = require('./models/Conn.js');
const db = new Conn(dbPath);

module.exports = db;

