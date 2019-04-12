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

	res.send('');
	//res.redirect('/');
});

// SERVICES

//Esta função avalia se já existe usuário ou cpf cadastrado no banco de dados, e retorna true para cada registro encontrado
router.post('/validaCadastro', (req, res) => {
	let data = {user: false, cpf: false};
	
	//search the database for entries for each parameter. Return true for each of existing entries
	console.log('Validacao', req.body);

	res.send(JSON.stringify(data));
});

module.exports = router;