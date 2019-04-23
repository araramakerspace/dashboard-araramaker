/*

File containg the database methods

Author: Raul Rosá
Created on: Tuesday, 16/04/2019

Objectives:
	In this file are the methods to get, post, put and delete data from the database.

*/

//Path to the database
const dbPath = 'araradatabase.db';

//Modules
const crypto = require('crypto');
const Conn = require('./models/Conn.js');
const db = new Conn(dbPath);


//GET
db.getUserById = async function(id){
	let user = {};
	let error = null;

	await this.get("SELECT id_user, name, email, cpf, permission FROM Users WHERE id_user = ?", [id])
	.then((result) => {
		if(result !== undefined)
			user = result;
		else
			error = "Error getting user by id";
	})

	return {error, user};
}

db.getSchedules = async function(){
	let schedules = {};
	let error = null;

	await this.all("SELECT weekDay, start_time, end_time, open FROM Schedules")
	.then((result) => {
		if(result !== undefined)
			schedules = result;
		else
			error = "Error getting schedules";
	});

	return {schedules, error};
}

//VALIDATE

db.validateSignin = async function(user, cpf){
	let data = {user: false, cpf: false};

	await this.all("SELECT name, cpf FROM Users WHERE name=? OR cpf=?", [user, cpf])
	.then((result) => {
		if(result !== undefined){
			result.forEach((row) => {
				if(row.name.toLowerCase() == user.toLowerCase())
					data.user = true;
				if(row.cpf.toLowerCase() === cpf.toLowerCase())
					data.cpf = true;
			});
		}
	})
	.catch((err) => {
		console.log("Error validating sign in: ", err);
	})

	return data;
}

db.validateLogin = async function(user, password){
	let data = {validation: true };

	await this.get("SELECT salt FROM Users WHERE name = ?", [user.toLowerCase()])
	.then(async (res) => {
		if(res !== undefined){
			let hash = crypto.pbkdf2Sync(password, res.salt, 10000, 512, 'sha512').toString('hex');
			await this.get("SELECT id_user FROM Users WHERE name = ? AND hash = ?",[user.toLowerCase(), hash])
			.then((result) => {
				if(result === undefined)
					data.validation = false;
				else
					data.id = result.id_user;
			});
		}
		else
			data.validation = false;
	});

	return data;
}

//INSERT

db.signIn = async function(user){
	if(user.senha != user.senhaConfirma)
		throw "Passwords don't match";

	user.salt = crypto.randomBytes(16).toString('hex');
	user.hash = crypto.pbkdf2Sync(user.senha, user.salt, 10000, 512, 'sha512').toString('hex');

	await this.run("INSERT INTO Users(name, email, cpf, hash, salt, permission) VALUES(?, ?, ?, ?, ?, ?)", [
		user.usuario.toLowerCase(),
		user.email.toLowerCase(),
		user.cpf,
		user.hash,
		user.salt,
		0
		]);
}

module.exports = db;

