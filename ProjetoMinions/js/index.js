/*
	Main page functions file

	Author: Raul Rosá
	Created on: Friday, 26/04/2019

	Objetives:
		Contains the functions used in the main page "Index", which involves:
		* Getting and setting the schedules table
		* Making reservations based on authentication

*/

/********************

	SCHEDULES

*******************/

const getSchedules = async function(){
	await axios.get('/schedules')
	.then(res => {
		if(!res.data.error){
			createScheduleTable(res.data.schedules);
		}
	});
}

const createScheduleTable = function(schedules){
	let startTime = 24, endTime = 1;
	let weekDays = [ [], [], [], [], [], [], [] ];

	schedules.forEach((schedule) => {
		if(schedule.start_time < startTime)
			startTime = schedule.start_time;
		if(schedule.end_time > endTime)
			endTime = schedule.end_time;

		switch(schedule.weekDay.toLowerCase()){
			case 'monday':
				for(let i = schedule.start_time; i < schedule.end_time; i++)
					weekDays[1].push({time: i, open: schedule.open, id_schedule: schedule.id_schedule});
				break;
			case 'tuesday':
				for(let i = schedule.start_time; i < schedule.end_time; i++)
					weekDays[2].push({time: i, open: schedule.open, id_schedule: schedule.id_schedule});
				break;
			case 'wednesday':
				for(let i = schedule.start_time; i < schedule.end_time; i++)
					weekDays[3].push({time: i, open: schedule.open, id_schedule: schedule.id_schedule});
				break;
			case 'thursday':
				for(let i = schedule.start_time; i < schedule.end_time; i++)
					weekDays[4].push({time: i, open: schedule.open, id_schedule: schedule.id_schedule});
				break;
			case 'friday':
				for(let i = schedule.start_time; i < schedule.end_time; i++)
					weekDays[5].push({time: i, open: schedule.open, id_schedule: schedule.id_schedule});
				break;
			case 'saturday':
				for(let i = schedule.start_time; i < schedule.end_time; i++)
					weekDays[6].push({time: i, open: schedule.open, id_schedule: schedule.id_schedule});
				break;
			case 'sunday':
				for(let i = schedule.start_time; i < schedule.end_time; i++)
					weekDays[0].push({time: i, open: schedule.open, id_schedule: schedule.id_schedule});
				break;
			default:
				break;
		}
	});

	let tableHeader = getScheduleHeader();
	let columnHeader = getHourIntervals(startTime, endTime);

	fillScheduleTable(synchronizeWeekdays(weekDays), tableHeader, columnHeader);
}

const getScheduleHeader = function(){
	let today = new Date();
	let tableHeader = [{date: 'Horários', day: null }, {date: 'Hoje', day: today.getDay(), id: getDateInStandard(today).id }];
	for(let i = 1; i < 7; i++)
		tableHeader.push(getDateInStandard(today, i));
	return tableHeader;
}

const getHourIntervals = function(startTime, endTime){
	let intervals = [];
	for(let i = startTime; i < endTime; i++){
		intervals.push({interval:  `${i}:00 - ${i+1}:00`, startTime: i});
	}
	return intervals;
}

const fillScheduleTable = function(content, header, columnHeader){
	let scheduleTable = gId("schedule-table");

	//Add the table header
	let tHead = document.createElement('thead');
		let tHeadRow = document.createElement('tr');
			for(let i = 0; i < header.length; i++)
				tHeadRow.appendChild(addTh(header[i].date, 'col'));
		tHead.appendChild(tHeadRow);
	scheduleTable.appendChild(tHead);

	let tBody = document.createElement('tbody');
		columnHeader.forEach((hd) => {
			let tBodyRow = document.createElement('tr');
				tBodyRow.appendChild(addTh(hd.interval, 'row'));

				for(let i = 0; i < content.length; i++){
					let obj = content[i].find((obj) => {return obj.time == hd.startTime});
					let date = new Date();
					let tdClass = "";
					let notifications = null;
					let tdId = null;
					if(date.getHours() >= hd.startTime && date.getDay() == header[i+1].day)
						tdClass = "bg-secondary"; //finished
					else if(obj === undefined)
						tdClass = "bg-danger"; //not exists
					else if(obj.open == 0)
						tdClass = "bg-danger"; //closed
					else{
						tdClass = "can-reserve" //can be reserved
						tdId = `h-${hd.startTime}-${header[i+1].id}-${header[i+1].day}-${obj.id_schedule}`;
					}
					//Add the reserved color and notifications.
					tBodyRow.appendChild(addTd(tdClass, notifications, tdId));
				}
			tBody.appendChild(tBodyRow);
		});
	scheduleTable.appendChild(tBody);
}

const addTh = function(text, scope){
	let th = document.createElement('th');
	th.scope = scope;
	th.appendChild(document.createTextNode(text));
	return th;
}

const addTd = function(tdClass, badge, id){
	let td = document.createElement('td');
	td.className += tdClass;
	if(badge){
		let span = document.createElement('span');
		span.className += "badge badge-light";
		span.appendChild(document.createTextNode(badge));
		td.appendChild(span);
	}
	if(id){
		td.id = id;
		td.addEventListener('click', () => {
			makeReservation(id);
		});
	}

	return td;
}

/*******************

	UTILITIES

*******************/

const synchronizeWeekdays = function(weekDays){
	let date = new Date();
	for(let i = 0; i < date.getDay(); i++){
		let day = weekDays.shift();
		weekDays.push(day);
	}

	return weekDays;
}

const getDateInStandard = function(date, dayOffset){
	let newDay = new Date();
	newDay.setDate(date.getDate() + (dayOffset ? dayOffset : 0));
	let dd = String(newDay.getDate()).padStart(2, '0');
	let mm = String(newDay.getMonth()+1).padStart(2, '0');

	return {date: dd + '/' + mm, day: newDay.getDay(), id: dd + '-' + mm };
}

/*************************

	RESERVATIONS

*************************/

const makeReservation = async function(id){
	let h = id.split('-');
	let hour = h[1];
	let day = h[2];
	let month = h[3];
	let weekDay = h[4];
	let id_schedule = h[5];
	let user;
	await axios.get('/session')
	.then((res) => {
		if(res.data.error)
			throw new Error('Please login');
		else
			user = res.data;
		return axios.post('/reservedEquipments', {id_schedule: id_schedule})
	})
	.then((res) => {
		let reservationForm = gId('reservation-panel');
		clearReservationPanel();

		let reserveDetails = document.createElement('div');
			reserveDetails.className += "form-row";
				let reserveDetailsP = document.createElement('p');
				reserveDetailsP.appendChild(document.createTextNode(`Reserva dia ${day}/${month}, das ${hour} as ${parseInt(hour)+1} horas`));
			reserveDetails.appendChild(reserveDetailsP);
		reservationForm.appendChild(reserveDetails);

		let selectRow = document.createElement('div');
			selectRow.className += "form-group form-row";

				let selectLabel = document.createElement('label');
				selectLabel.for = 'selectEquipments';
				selectLabel.appendChild(document.createTextNode('Deseja reservar algum equipamento?'));
			selectRow.appendChild(selectLabel);

				let selectInput = document.createElement('select');
				selectInput.className += "form-control";
				selectInput.id = "selectEquipments";
				selectInput.name = "selectEquipments";
					let defaultOption = document.createElement('option');
					defaultOption.value = -1;
					defaultOption.appendChild(document.createTextNode('Selecione'));
				selectInput.appendChild(defaultOption);

				res.data.forEach((equipment) => {
					let newOption = document.createElement('option');
					newOption.value = equipment.id_equipment;
					newOption.appendChild(document.createTextNode(equipment.name));
					newOption.id = `max-${equipment.qtd}`;
					selectInput.appendChild(newOption);
				});

			selectRow.appendChild(selectInput);
		reservationForm.appendChild(selectRow);

		let hiddenGroup = document.createElement('div');
		hiddenGroup.id = "equipGroupInputs";
		hiddenGroup.className += "form-group";

		reservationForm.appendChild(hiddenGroup);

		let confirmDiv = document.createElement('div');
		confirmDiv.className += "d-flex flex-row justify-content-center";
			let confirmBtn = document.createElement('button');
			confirmBtn.className += "btn btn-primary m-a";
			confirmBtn.appendChild(document.createTextNode("Reservar"));

			confirmDiv.appendChild(confirmBtn);
		reservationForm.appendChild(confirmDiv);

		selectInput.addEventListener('change', (e) => addEquipmentInPanel(e, hiddenGroup));
		confirmBtn.addEventListener('click', (e) => confirmReservation(e, user, {hour, day, month, weekDay}));
	});
}

const loadReservationPanel = function(user, schedule){
	let title = gId("reservation-title");
	let form = gId("reservation-panel");

	if(user){
		while(title.firstChild)
			title.removeChild(title.firstChild);
		title.appendChild(document.createTextNode(`Bem-vindo(a) ${user.name}! Faça suas reservas clicando no horário desejado na tabela.`));

	}
}

const addEquipmentInPanel = function(e, hiddenGroup){
	let select = e.target;
	let selected = select.options[select.selectedIndex];
	
	if(selected.value != -1){
		let name = "equip-"+selected.value;
		let equipmentsInPanel = document.getElementsByClassName("reservation-equipment-input");
		if(equipmentsInPanel.length > 0){
			for(let i = 0; i < equipmentsInPanel.length; i++) {
				if(equipmentsInPanel[i].name == name)
					return;
			}
		}

		let newFormRow = document.createElement('div');
		newFormRow.className += "form-row input-group";
			let newPrepend = document.createElement('div');
			newPrepend.className += "input-group-prepend";
				let newLabel = document.createElement('label');
				newLabel.for = name;
				newLabel.className += "input-group-text";
				newLabel.appendChild(document.createTextNode(selected.text));
				newPrepend.appendChild(newLabel);
			newFormRow.appendChild(newPrepend);

			let newInput = document.createElement('input');
			newInput.type = "number";
			newInput.name = name;
			newInput.id = name;
			newInput.className += "form-control reservation-equipment-input";
			newInput.min = 0;
			newInput.max = parseInt(selected.id.split('-')[1]);
			newInput.value = 0;
			newFormRow.appendChild(newInput);

			let deleteLinkDiv = document.createElement('div');
			deleteLinkDiv.className += "input-group-prepend";
				let newLink = document.createElement('a');
				newLink.href = "#";
				newLink.className += "text-danger input-group-text";
				newLink.innerHTML = '&times;';
				newLink.addEventListener('click', () => deleteReservatonEquipmentInput(hiddenGroup, newFormRow));
				deleteLinkDiv.appendChild(newLink);
			newFormRow.appendChild(deleteLinkDiv);
		hiddenGroup.appendChild(newFormRow);
	}
}

const confirmReservation = async function(e, user, schedule){
	e.preventDefault();
	let equipments = [];
	let reservation = {id_user: user.id_user, weekDay: getWeekDay(schedule.weekDay), startTime: schedule.hour, date: getSQLDate(schedule.day, schedule.month)};

	let equipmentsInPanel = document.getElementsByClassName("reservation-equipment-input");
	for(let i = 0; i < equipmentsInPanel.length; i++){
		if(parseInt(equipmentsInPanel[i].value) > 0)
			equipments.push({id_equipment: parseInt(equipmentsInPanel[i].id.split('-')[1]), qtd: parseInt(equipmentsInPanel[i].value)});
	}

	await axios.post('/confirmReservation',{reservation, equipments})
	.then((res) => {
		clearReservationPanel();
		gId("reservation-panel").appendChild(document.createTextNode("Reserva efetuada! Aguarde a confirmação de um administrador."));
	})
	.catch(()=>{
		clearReservationPanel();
		gId("reservation-panel").appendChild(document.createTextNode("Houve um erro ao efetuar a reserva. Tente novamente mais tarde."));
	})
}

const clearReservationPanel = function(){
	let reservationForm = gId('reservation-panel');
	while(reservationForm.firstChild)
		reservationForm.removeChild(reservationForm.firstChild)
}

const deleteReservatonEquipmentInput = function(parent, row){
	parent.removeChild(row);
}

const getSQLDate = function(day, month){
	return "2000-"+month+"-"+day;
}

/******************

	EVENTS

*******************/

window.addEventListener('load', ()=> {
	getSchedules();
});