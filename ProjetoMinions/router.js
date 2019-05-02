/*

Router file

Author: Raul Rosá
Created on: Thursday, 11/04/2019

Objectives:
	Specifies the routes for which the server must redirect the users, and some other functionalities.

*/

const express = require('express');
const path = require('path');
const router = express.Router();
const sql = require('./db');

// PAGES

router.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/public/index.html'));
});
router.get('/cadastro',function(req,res){
	res.sendFile(path.join(__dirname+'/public/cadastro.html'));
});
router.get('/about',function(req,res){
	res.sendFile(path.join(__dirname+'/public/sobre.html'));
});
router.get('/admin',function(req,res){
	if(req.session.user){
		if(req.session.user.permission == 1)
			res.sendFile(path.join(__dirname+'/public/admin.html'));
		else
			res.redirect('/');
	}
	else
		res.redirect('/');
	
});
router.get('/redefinirSenha', function(req, res){
	res.status(404).send('Page not Found');
});

// DATA GET

//This functions returns the session's info to the page
router.get('/session', (req, res) => {
	if(req.session.user)
		res.send(JSON.stringify(req.session.user));
	else
		res.send(JSON.stringify({error: true}));
})

router.get('/users', (req, res) => {
	sql.getUsers()
	.then((data) => {
		if(data.error)
			res.status(500).send("Couldn't get database information.");
		else
			res.send(JSON.stringify(data));
	});
})

router.get('/schedules', (req, res) => {
	sql.getSchedules()
	.then((data) => {
		if(data.error)
			res.status(500).send("Couldn't get database information.");
		else
			res.send(JSON.stringify(data));
	});
})

router.get('/equipments', (req, res) => {
	sql.getEquipments()
	.then((data) => {
		if(data.error)
			res.status(500).send("Couldn't get database information.");
		else
			res.send(JSON.stringify(data));
	});
})

router.post('/reservedEquipments',(req, res) => {
	sql.getReservedEquipments(req.body)
	.then((data) => {
		if(data.error)
			res.status(500).send("Couldn't get database information.")
		else
			res.send(JSON.stringify(data.res))
	})
});

router.post('/getReservations', (req, res) => {
	sql.getReservations()
	.then((data) => {
		if(data.res)
			res.send(JSON.stringify(data.res));
		else
			res.status(500).send(JSON.stringify(data.error))
	})
});

router.post('/getScheduleReservations', (req, res) => {
	sql.getScheduleReservations(req.body)
	.then((data) => {
		if(data.res)
			res.send(JSON.stringify(data.res));
		else
			res.status(500).send(JSON.stringify(data.error))
	})
});

router.post('/equipmentsForReservation', (req, res) => {
	sql.getEquipmentsForReservation(req.body)
	.then((data) => {
		if(data.res)
			res.send(JSON.stringify(data.res));
		else
			res.status(500).send(JSON.stringify(null))
	})
});

// DATA POSTS

router.post('/signin', function(req,res){
	sql.signIn(req.body).then(
		() => res.redirect('/')
	);
});

router.post('/addEquipment', function(req,res){
	sql.addEquipment(req.body)
	.then((result) => {
		if(result)
			res.send("Inserindo!");
		else
			res.status(500).send("Error updating schedules.");
	});
});

router.post('/confirmReservation', function(req,res){
	sql.makeReservation(req.body)
	.then((result) => {
		if(result)
			res.send("Made reservation!");
		else
			res.status(500).send("Error updating schedules.");
	});
});

//This route logs the user in
router.post('/login', (req, res) => {

	if(req.session){
		sql.getUserById(req.session.idUser)
		.then((result) => {
			if(result.err)
				res.redirect("/error");
			req.session.user = result.user;
			res.redirect("/");
		});
	}
	else
		res.redirect('/error');
});

//This route logs the user out
router.get('/logout', (req, res) => {
	if(req.session){
		//delete session obj
		req.session.destroy((err) => {
			if(err) return next(err);
			else return res.redirect('/');
		});
	}
})

// DATA UPDATE

router.post('/updateSchedules', (req, res) => {
	if(req.session.user){
		if(req.session.user.permission == 1){
			sql.updateSchedules(req.body)
			.then((result) => {
				if(result)
					res.send("Atualizado!");
				else
					res.status(500).send("Error updating schedules.");
			})
		}
		else
			res.status(401).send("Unauthorized acess");
	}
	else
		res.status(403).send("Access denied");
})

router.post('/editEquipment',(req, res) => {
	if(req.session.user){
		if(req.session.user.permission == 1){
			sql.updateEquipment(req.body)
			.then((result) => {
				if(result)
					res.send("Atualizado!");
				else
					res.status(500).send("Error updating equipments.");
			})
		}
		else
			res.status(401).send("Unauthorized acess");
	}
	else
		res.status(403).send("Access denied");
});

router.post('/giveAdmin',(req, res) => {
	if(req.session.user){
		if(req.session.user.permission == 1){
			sql.alterUserPermission(req.body)
			.then((result) => {
				if(result)
					res.send("Atualizado!");
				else
					res.status(500).send("Error updating equipments.");
			})
		}
		else
			res.status(401).send("Unauthorized acess");
	}
	else
		res.status(403).send("Access denied");
});

router.post('/acceptReservation', (req, res) => {
	if(req.session.user){
		if(req.session.user.permission == 1){
			sql.acceptReservation(req.body)
			.then((data) => {
				if(data)
					res.send("Atualizado!");
				else
					res.status(500).send("Error updating reservation.");
			})
		}
		else
			res.status(401).send("Unauthorized acess");
	}
	else
		res.status(403).send("Access denied");
})

// DATA DELETE

router.post('/deleteUser',(req, res) => {
	if(req.session.user){
		if(req.session.idUser == req.body.id){
			sql.deleteUser(req.body.id)
			.then((result) => {
				res.send(JSON.stringify({success: result.success, error: result.error}));
			})
		}
		else
			res.status(401).send("Unauthorized acess");
	}
	else
		res.status(403).send("Access denied");
})

router.post('/deleteEquipment', (req, res) => {
	if(req.session.user){
		if(req.session.user.permission == 1){
			sql.deleteEquipment(req.body)
			.then((result) => {
				if(result)
					res.send("Deletado!");
				else
					res.status(500).send("Error deleting equipment.");
			})
		}
		else
			res.status(401).send("Unauthorized acess");
	}
	else
		res.status(403).send("Access denied");
});

router.post('/declineReservation', (req, res) => {
	if(req.session.user){
		if(req.session.user.permission == 1){
			sql.deleteReservation(req.body)
			.then((data) => {
				if(data)
					res.send("Deletado!");
				else
					res.status(500).send("Error deleting reservation.");
			})
		}
		else
			res.status(401).send("Unauthorized acess");
	}
	else
		res.status(403).send("Access denied");
})

// SERVICES

//This function checks if there's already a user or cpf registered on the database, and returns true for each registry found
router.post('/validaCadastro', (req, res) => {
	//search the database for entries for these parameters. Returns true for each of existing entries
	sql.validateSignin(req.body.user, req.body.cpf)
	.then((data) => {
		res.send(JSON.stringify(data));
	})
});

//This functions checks if the user or the password is valid. It returns true for each valid field
router.post('/checkLogin', (req, res) => {
	sql.validateLogin(req.body.user, req.body.password)
	.then((data) => {
		if(data.validation){
			req.session.idUser = data.id;
		}
		res.send(JSON.stringify(data.validation));
	});
});

module.exports = router;