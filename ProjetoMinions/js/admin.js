/*
	Admin page functionalities file

	Author: Raul Rosá
	Created on: Tuesday, 23/04/2019

	Objetives:
		Contains the functionalities of the admin page. Most of them consists in making HTTP requests to the server regarding
		database information, and awaiting response

*/

/********************

	GET SCHEDULES

*******************/

window.addEventListener('load', async function(){
	await axios.get('/schedules')
	.then(res => {
		if(!res.data.error){
			let startTime = 24, endTime = 1;
			let schedules = res.data.schedules;
			let weekDays = [ [], [], [], [], [], [], [] ];

			schedules.forEach((schedule) => {
				if(schedule.start_time < startTime)
					startTime = schedule.start_time;
				if(schedule.end_time > endTime)
					endTime = schedule.end_time;

				switch(schedule.weekDay.toLowerCase()){
					case 'monday':
						for(let i = schedule.start_time; i < schedule.end_time; i++)
							weekDays[1].push({time: i, open: schedule.open});
						break;
					case 'tuesday':
						for(let i = schedule.start_time; i < schedule.end_time; i++)
							weekDays[2].push({time: i, open: schedule.open});
						break;
					case 'wednesday':
						for(let i = schedule.start_time; i < schedule.end_time; i++)
							weekDays[3].push({time: i, open: schedule.open});
						break;
					case 'thursday':
						for(let i = schedule.start_time; i < schedule.end_time; i++)
							weekDays[4].push({time: i, open: schedule.open});
						break;
					case 'friday':
						for(let i = schedule.start_time; i < schedule.end_time; i++)
							weekDays[5].push({time: i, open: schedule.open});
						break;
					case 'saturday':
						for(let i = schedule.start_time; i < schedule.end_time; i++)
							weekDays[6].push({time: i, open: schedule.open});
						break;
					case 'sunday':
						for(let i = schedule.start_time; i < schedule.end_time; i++)
							weekDays[0].push({time: i, open: schedule.open});
						break;
					default:
						break;
				}
			});

			let today = new Date();
			let tableHeader = ['Horários', 'Hoje'];
			for(let i = 1; i < 7; i++)
				tableHeader.push(getDateInStandard(today, i));

			console.log(schedules);
			console.log(weekDays);
			console.log(tableHeader);

			//let scheduleMatrix = [];
			//for(let i = startTime; i < endTime; i++){

			//}
		}
	});
});

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

const getDateInStandard = function(date, dayOffset){
	let newDay = new Date();
	newDay.setDate(date.getDate() + (dayOffset ? dayOffset : 0));
	let dd = String(newDay.getDate()).padStart(2, '0');
	let mm = String(newDay.getMonth()+1).padStart(2, '0');

	return dd + '/' + mm;
}