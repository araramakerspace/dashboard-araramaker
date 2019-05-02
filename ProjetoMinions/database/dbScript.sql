CREATE TABLE Users(
id_user    integer NOT NULL PRIMARY KEY AUTOINCREMENT ,
name       varchar(60) NOT NULL ,
email      varchar(60) NOT NULL ,
cpf        varchar(11) NOT NULL UNIQUE ,
hash       varchar NOT NULL ,
salt       varchar NOT NULL ,
permission binary NOT NULL
);

CREATE TABLE Equipments(
id_equipment integer NOT NULL PRIMARY KEY AUTOINCREMENT ,
name         varchar(60) NOT NULL ,
description  text NOT NULL ,
qtd          integer NOT NULL
);

CREATE TABLE Schedules(
id_schedule integer NOT NULL PRIMARY KEY AUTOINCREMENT ,
weekDay     varchar NOT NULL ,
period		varchar NOT NULL,
start_time  integer NOT NULL ,
end_time	integer NOT NULL ,
open		binary NOT NULL
);

CREATE TABLE Schedule_Equipments(
id_schedule_equipment integer NOT NULL PRIMARY KEY AUTOINCREMENT ,
id_schedule           integer NOT NULL ,
id_equipment          integer NOT NULL ,
qtd                   integer NOT NULL ,
FOREIGN KEY (id_schedule) REFERENCES Schedule (id_schedule),
FOREIGN KEY (id_equipment) REFERENCES Equipments (id_equipment) ON DELETE CASCADE
);

CREATE TABLE Reservation
(
id_reservation integer NOT NULL PRIMARY KEY AUTOINCREMENT ,
id_user        integer NOT NULL ,
id_schedule    integer NOT NULL ,
start_time	   integer NOT NULL ,
confirmed	   binary NOT NULL,
date		   date NOT NULL,
FOREIGN KEY (id_user) REFERENCES Users (id_user) ON DELETE CASCADE,
FOREIGN KEY (id_schedule) REFERENCES Schedule (id_schedule),
CONSTRAINT UN_Reservation UNIQUE (id_user, id_schedule, start_time)
);

CREATE TABLE Reservation_Equipment(
id_reservation_equipment integer NOT NULL PRIMARY KEY AUTOINCREMENT ,
id_reservation           integer NOT NULL ,
id_equipment             integer NOT NULL ,
qtd                      integer NOT NULL ,
FOREIGN KEY (id_reservation) REFERENCES Reservation (id_reservation) ON DELETE CASCADE,
FOREIGN KEY (id_equipment) REFERENCES Equipments (id_equipment) ON DELETE CASCADE
);