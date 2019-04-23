/*
	Main functionalities file

	Author: Raul Rosá
	Created on: Tuesday, 09/04/2019

	Objetives:
		Contains the functionalities in general use by all or most of the pages in the dashboard.

*/

const gId = function(id){
	return document.getElementById(id);
}

/********************

	GET SESSION INFO

*******************/

window.addEventListener('load', async function(){
	await axios.get('/session')
	.then(res => {
		if(!res.data.error){
			let user = res.data;
			user.admin = (user.permission == 1);
			alterNavbar(user.name, user.id_user, user.permission);
		}
	});
});

/********************

	LOGIN

*******************/

const loginBtn = gId('loginBtn');
if(loginBtn){
	loginBtn.addEventListener('click', async function(event){
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
			if(!res.data)
				usuario.setCustomValidity('Usuário inválido');
			else
				usuario.setCustomValidity('');

			if(!res.data)
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
}


/********************

	FUNCTIONS

*******************/

const alterNavbar = function(user, userId, permission){
	//Makes the logout button on the user dropdown
	let loginDropdown = gId("loginDropdown");
	let formLogin = gId("formLogin");
	if(formLogin)
		loginDropdown.removeChild(formLogin);

	loginDropdown.children[0].removeChild(loginDropdown.children[0].firstChild);

	let userName = document.createTextNode(user);

	loginDropdown.children[0].appendChild(userName);
	addLogoutDropdown(loginDropdown);


	//adds a new Admin tab for easy access
	let navUl = gId('navUl');
	if(navUl)
		addAdminBar(navUl);

}

const addLogoutDropdown = function(loginDropdown){
	let newDropdown = document.createElement('ul');
	newDropdown.className += 'dropdown-menu';

		let newLi = document.createElement('li');
		newLi.className += 'input-group';

			let logoutLink = document.createElement('a');
			logoutLink.href = "/logout";
			logoutLink.className += "details";
			logoutLink.appendChild(document.createTextNode("Sair"));

			newLi.appendChild(logoutLink);
		newDropdown.appendChild(newLi);
	loginDropdown.appendChild(newDropdown);
}

const addAdminBar = function(navUl){
	let newLi = document.createElement('li');
	newLi.className += 'nav-item';

		let adminLink = document.createElement('a');
		adminLink.className += 'nav-link';
		adminLink.href = "/admin";
		adminLink.appendChild(document.createTextNode('Admin'));

		newLi.appendChild(adminLink);

	navUl.appendChild(newLi);
}