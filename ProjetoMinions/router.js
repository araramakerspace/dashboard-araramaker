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
	console.log('Cadastro', req.body);

	//add the values to of the request to the database

	res.send('Cadastrando');
	//res.redirect('/');
});

//This routes logs the user in
router.post('/login', (req, res) => {

	//makes the user log in.

	res.send('Efetuando login');
});

// SERVICES

//This function checks if there's already a user or cpf registered on the database, and returns true for each registry found
router.post('/validaCadastro', (req, res) => {
	let data = {user: false, cpf: false};
	
	//search the database for entries for each parameter. Return true for each of existing entries
	console.log('Validacao', req.body, data);

	res.send(JSON.stringify(data));
});

//This functions checks if the user os the password is valid. It returns true for each valid field
router.post('/checkLogin', (req, res) => {
	let data = {user: true, password: true}

	console.log('Entrando', res.body, data);

	res.send(JSON.stringify(data));
});


module.exports = router;