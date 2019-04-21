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
const sql = require('./db.js');

// PAGES

router.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/index.html'));
});
router.get('/cadastro',function(req,res){
	res.sendFile(path.join(__dirname+'/cadastro.html'));
});
router.get('/redefinirSenha', function(req, res){
	res.status(404).send('Page not Found');
});

// DATA POSTS

router.post('/signin', function(req,res){
	sql.signIn(req.body).then(
		() => res.redirect('/')
	);
});

//This routes logs the user in
router.post('/login', (req, res) => {

	if(req.session){
		sql.getUserById(req.session.idUser)
		.then((result) => {
			if(result.err) {
				res.redirect("/error");
			}
			req.session.user = result.user;
			res.redirect("/");
		});
	}
	else
		res.redirect('/error');
});

// SERVICES

//This function checks if there's already a user or cpf registered on the database, and returns true for each registry found
router.post('/validaCadastro', (req, res) => {

	//search the database for entries for these parameters. Returns true for each of existing entries
	sql.validateSignin(req.body.user, req.body.cpf)
	.then((data) => {
		res.send(JSON.stringify(data));
	})
});

//This functions checks if the user os the password is valid. It returns true for each valid field
router.post('/checkLogin', (req, res) => {
	sql.validateLogin(req.body.user, req.body.password)
	.then((data) => {
		if(data.validation){
			req.session.idUser = data.id;
		}
		res.send(JSON.stringify(data.validation));
	});
});

//This functions returns the session's info to the page
router.get('/session', (req, res) => {
	if(req.session.user)
		res.send(JSON.stringify(req.session.user));
	else
		req.status(404).send({error: true});
})


module.exports = router;