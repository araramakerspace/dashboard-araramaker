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

db.getUsers = async function(){
	let users = {};
	let error = null;

	await this.all("SELECT id_user, name, email, cpf, permission FROM Users")
	.then((result) => {
		if(result !== undefined)
			users = result;
		else
			error = "Error getting users";
	});

	return {users, error};
}

db.getSchedules = async function(){
	let schedules = {};
	let error = null;

	await this.all("SELECT id_schedule, weekDay, start_time, end_time, open FROM Schedules")
	.then((result) => {
		if(result !== undefined)
			schedules = result;
		else
			error = "Error getting schedules";
	});

	return {schedules, error};
}

db.getEquipments = async function(){
	let equipments = {};
	let error = null;

	await this.all("SELECT id_equipment, name, description, qtd FROM Equipments")
	.then((result) => {
		if(result !== undefined)
			equipments = result;
		else
			error = "Error getting equipments";
	});

	return {equipments, error};
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

db.addEquipment = async function(equipment){
	let res;
	await this.run("INSERT INTO Equipments(name, description, qtd) VALUES(?, ?, ?)", [
		equipment.name.toLowerCase(),
		equipment.description,
		equipment.qtd
		]
	)
	.then(() => {
		res = true;
	})
	.catch((err) => {
		res = false;
	});

	return res;
}

db.makeReservation = async function(reservation){
	let res;
	await this.run("INSERT INTO Reservation(id_user, id_schedule, start_time, confirmed, date) VALUES(?, ?, ?, ?, ?)", [
		reservation.id_user,
		reservation.id_schedule,
		reservation.start_time,
		reservation.confirmed,
		reservation.date
		]
	)
	.then((id) => {
		let query = "INSERT INTO Reservation_Equipment(id_reservation, id_equipment, qtd) VALUES ";
		reservation.equipment.forEach((equip, i) => {
			query += `(${equip.id_reservation}, ${id_equipment}, ${qtd})${(i == (reservation.equipment.length - 1))}`;
		});
		this.run(query)
		.then(() => {
			res = true;
		})
		.catch((err) => {
			res = false;
		});
	})
	.catch((err) => {
		res = false;
	});

	return res;
}

//UPDATE

db.updateSchedules = async function(schedules){
	let query = "";
	let res;
	
	schedules.forEach((sh) => {
		query += `UPDATE Schedules SET start_time = ${sh.morning.startTime}, end_time = ${sh.morning.endTime}, open = ${(sh.morning.check)? 1 : 0} WHERE weekDay = '${sh.weekDay}' AND period = 'morning';`;
		query += `UPDATE Schedules SET start_time = ${sh.noon.startTime}, end_time = ${sh.noon.endTime}, open = ${(sh.noon.check)? 1 : 0} WHERE weekDay = '${sh.weekDay}' AND period = 'noon';`;
		query += `UPDATE Schedules SET start_time = ${sh.night.startTime}, end_time = ${sh.night.endTime}, open = ${(sh.night.check)? 1 : 0} WHERE weekDay = '${sh.weekDay}' AND period = 'night';`;
	});
	await this.exec(query)
	.then(() => {
		res = true;
	})
	.catch((err) => {
		res = false;
	});

	return res;
}

db.updateEquipment = async function(equipment){
	let res;
	
	await this.run("UPDATE Equipments SET name = ?, description = ?, qtd = ? WHERE id_equipment = ?",[
			equipment.name,
			equipment.description,
			equipment.qtd,
			equipment.id
		])
	.then(() => {
		res = true;
	})
	.catch((err) => {
		res = false;
	});

	return res;
}

db.alterUserPermission = async function(user){
	let res;
	
	await this.run("UPDATE Users SET permission = 1")
	.then(() => {
		res = true;
	})
	.catch((err) => {
		res = false;
	});

	return res;
}

//DELETE

db.deleteEquipment = async function(idEquip){
	let res;

	await this.run("DELETE from Equipments WHERE id_equipment = ?", [ idEquip.id ])
	.then(() => {
		res = true;
	})
	.catch((err) => {
		res = false;
	});

	return res;
}

module.exports = db;

