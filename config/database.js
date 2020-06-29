
const mysql = require('mysql');
    const con = mysql.createConnection({
        host: "localhost",
        port:"3306",
        user: "event",
        password: "event@123",
        database: "eventsDb2019"
    });

    con.connect((err) => {
        if (err) {
            console.log('Error connecting to Db');
            return;
        }
   
        console.log('Connection established');
    });

    module.exports = con;


    // const  Sequelize  = require('sequelize');
    // const sequelize =  new Sequelize('eventsDb2019', 'event','event@123', {
    //     host: 'localhost',
    //     dialect:  'mysql'
    //   });

    //  module.exports = sequelize;





