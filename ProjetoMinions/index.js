/*

Main file for the server

Author: Raul Rosá
Created on: Friday, 05/04/2019

Objectives:


*/

const express = require('express')
const app = express();
const path = require('path');
const router = express.Router();

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/about.html'));
});

router.get('/sitemap',function(req,res){
  res.sendFile(path.join(__dirname+'/sitemap.html'));
});

//Adds static paths to the folders the files will reference
app.use('/img', express.static('img'))
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))

//add the router
app.use('/', router);
app.listen(process.env.port || 8000);

console.log('Server running at Port 8000');