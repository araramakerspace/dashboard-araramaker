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

db.getReservedEquipments = async function(){
	let res, error;

	await this.all("SELECT se.id_equipment, e.name, se.qtd FROM Schedule_Equipments se, Equipments e WHERE se.id_equipment = e.id_equipment AND se.id_schedule = 2")
	.then((result) => {
		res = result;
		return this.all("SELECT se.id_equipment, e.name, SUM(re.qtd) as totalQtd FROM Schedule_Equipments se, Reservation r, Reservation_Equipment re, Equipments e WHERE r.id_reservation = re.id_reservation AND se.id_schedule = r.id_schedule AND se.id_equipment = re.id_equipment AND se.id_equipment = e.id_equipment")
	})
	.then((result) => {
		if(result[0].id_equipment && result[0].name && result[0].totalQtd){
			result.forEach((equip) => {
				let element = res.find((el) => {
					return el.id_equipment == equip.id_equipment;
				})
				if(element.qtd <= equip.totalQtd)
					res.splice(res.indexOf(element), 1)
				else
					res[res.indexOf(element)].qtd -= equip.totalQtd;
			})
		}
		error = null;
	})
	.catch((err) => {
		res = null;
		error = true;
	})

	return {res, error};
}

db.getReservations = async function(){
	let res, error;
	await this.all("SELECT s.id_schedule, s.start_time, s.weekDay, r.id_user, r.id_reservation, u.name, r.confirmed FROM Schedules s, Reservation r, Users u WHERE s.Open = 1 and s.id_schedule = r.id_schedule AND u.id_user=r.id_user")
	.then((result) => {
		res = result;
		error = null;
	})
	.catch((err) => {
		res = null;
		error = err;
	})

	return {res, error}
}

db.getScheduleReservations = async function(data){
	let res, error;
	await this.all("SELECT u.name, r.id_reservation, u.id_user FROM Reservation r, Users u, Schedules s WHERE u.id_user = r.id_user AND r.id_schedule = s.id_schedule AND r.confirmed = 0 AND r.start_time = ? AND s.weekDay = ? AND s.id_schedule = ?", 
		[
		data.startTime,
		data.weekDay,
		data.id_schedule
		]
	)
	.then((result) => {
		res = result;
		error = null;
	})
	.catch((err) => {
		res = null;
		error = err;
	})

	return {res, error}
}

db.getEquipmentsForReservation = async function(data){
	let res, error;

	await this.all("SELECT e.name, re.qtd FROM Reservation_Equipment re, Equipments e WHERE e.id_equipment = re.id_equipment AND re.id_reservation = ?", [data.id])
	.then((result) => {
		res = result;
		error = null;
	})
	.catch((err) => {
		res = null;
		error = err;
	})

	return {res, error}
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
	let id;
	await this.run("INSERT INTO Equipments(name, description, qtd) VALUES(?, ?, ?)", [
		equipment.name.toLowerCase(),
		equipment.description,
		equipment.qtd
		]
	)
	.then((id) => {
		return {schedules: this.all("SELECT * FROM Schedules"), id: id};
	})
	.then(async (data, id) => {
		let query = "INSERT INTO Schedule_Equipments(id_schedule, id_equipment, qtd) VALUES";
		let schedules = await data.schedules;
		schedules.forEach((sh, i) => {
			query += `(${sh.id_schedule}, ${data.id.id}, ${equipment.qtd})${(i == (schedules.length - 1)) ? '' : ','}`;
		});
		return this.run(query)
	})
	.then(() => {
		res = true;
	})
	.catch((err) => {
		res = false;
	});

	return res;
}

db.makeReservation = async function(data){
	let reservation = data.reservation;
	let equipments = data.equipments;
	let res;
	await this.run("INSERT INTO Reservation(id_user, id_schedule, start_time, confirmed, date) VALUES(?, (SELECT id_schedule FROM Schedules WHERE start_time <= ? AND end_time >= ? AND weekDay = ? AND Open = 1), ?, ?, ?)", [
		reservation.id_user,
		reservation.startTime,
		reservation.startTime,
		reservation.weekDay,
		reservation.startTime,
		0,
		reservation.date
		]
	)
	.then((id) => {
		if(equipments.length > 0){
			let query = "INSERT INTO Reservation_Equipment(id_reservation, id_equipment, qtd) VALUES ";
			equipments.forEach((equip, i) => {
				query += `(${id.id}, ${equip.id_equipment}, ${equip.qtd})${(i == (equipments.length - 1)) ? '' : ','}`;
			});
			return this.run(query)
		}
		else
			return
	})
	.then(() => {
		res = true;
	})
	.catch((err) => {
		console.log(err);
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
	
	await this.run("UPDATE Users SET permission = 1 WHERE id_user = ?", [user.id_user])
	.then(() => {
		res = true;
	})
	.catch((err) => {
		res = false;
	});

	return res;
}

db.acceptReservation = async function(data){
	let res;

	await this.run("UPDATE Reservation SET confirmed = 1 WHERE id_reservation = ?", [data.id_reservation])
	.then(()=>{
		res = true;
	})
	.catch(() => {
		res = false;
	})

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

db.deleteReservation = async function(data){
	let res;

	await this.run("DELETE from Reservation WHERE id_reservation = ?", [data.id_reservation])
	.then(() => {
		res = true;
	})
	.catch(() => {
		res = false;
	})

	return res;
}

module.exports = db;

