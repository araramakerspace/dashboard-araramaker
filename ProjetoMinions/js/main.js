/*
	Main functionalities file

	Author: Raul Rosá
	Created on: Tuesday, 09/04/2019

	Objetives:
		Contains the functionalities in general use by all or most of the pages in the dashboard.

*/

var gId = function(id){
	return document.getElementById(id);
}

/********************

	LOGIN

*******************/

gId('loginBtn').addEventListener('click', async function(event){
	event.preventDefault();
	this.disabled = true;

	let form = gId('formLogin');
	let usuario = gId('loginUser');
	let password = gId('loginPassword');

	//Sending request to server to check the user/pass validity
	const data = {user: usuario.value, password: password.value};
			
	//Envia uma requisição para checar se o usuario ou a senha são validos
	await axios.post('/checkLogin', data)
	.then(res => {
		if(!res.data.user)
			usuario.setCustomValidity('Usuário inválido');
		else
			usuario.setCustomValidity('');

		if(!res.data.password)
			password.setCustomValidity('Senha inválida');
		else
			password.setCustomValidity('');
	})
	.catch(err => {
		console.error(err);
		return submit.disabled = true;
	})


	form.classList.add('was-validated');
	this.disabled = false;
	if (form.checkValidity() === false) {
  		event.stopPropagation();
	}
	else{
    	form.submit();
	}
});
