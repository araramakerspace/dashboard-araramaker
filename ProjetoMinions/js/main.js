var port = 'http://localhost:8000'; //use to connect to server sockets

var gId = function(id){
	return document.getElementById(id);
}

// CADASTRO

var validaCadastro = function(socket) {
	// Pega os formularios que queremos poder validar
	var forms = document.getElementsByClassName('needs-validation');

	// Itera sobre eles evitando que sejam enviados
	var validation = Array.prototype.filter.call(forms, function(form) {

		let usuario = gId('usuario');
		let email = gId('email');
		let cpf = gId('cpf');
		let cpfValid = true;
		let senha = gId('senha');
		let senhaConfirma = gId('senhaConfirma');
		let submit = gId('registrar');

		form.addEventListener('submit', function(event) {
			submit.disabled = true;

			/**************************************************

			Adiciona métodos de validação personalizados

			**************************************************/

			socket.emit('signinValidation', {user: usuario.value, cpf: cpf.value});

			socket.on('signinResponse', function(response){
				if(!response.user)
					usuario.setCustomValidity('Usuário inválido');
				else
					usuario.setCustomValidity('');

				cpfValid = response.cpf;

				submit.disabled = false;
			})

			//email deve estar no formato xxx@xxx.xxx
			let validaEmail = email.value.split('@');
			if(validaEmail[1]){
				let last = validaEmail[1].split('.');
				validaEmail.pop();
				validaEmail = validaEmail.concat(last);
			}

			if(validaEmail.length < 3)
				email.setCustomValidity('E-mail inválido');
			else
				email.setCustomValidity('');

			if(!TestaCPF(cpf.value) || !cpfValid)
				cpf.setCustomValidity('CPF inválido');
			else
				cpf.setCustomValidity('');

			if(gId('senha').value != senhaConfirma.value)
				senhaConfirma.setCustomValidity('As senhas devem ser iguais!');
			else
				senhaConfirma.setCustomValidity('');


	    	if (form.checkValidity() === false) {
	      		event.preventDefault();
	      		event.stopPropagation();
	    	}
	    	form.classList.add('was-validated');
		}, false);
	});
}

function TestaCPF(strCPF) {
	let Soma = 0;
    let Resto;
	if (strCPF == "00000000000") return false;

	for(let i = 0; i < strCPF.length; i++){
		if(isNaN(parseInt(strCPF[i])))
			return false;
	}
     
  	for (i=1; i<=9; i++)
  		Soma += parseInt(strCPF.substring(i-1, i)) * (11 - i);
  	Resto = (Soma * 10) % 11;
   
    if ((Resto == 10) || (Resto == 11))
    	Resto = 0;

    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;

	Soma = 0;
    for (i = 1; i <= 10; i++)
    	Soma += parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))
    	Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
}