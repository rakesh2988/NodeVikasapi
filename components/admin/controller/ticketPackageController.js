const con = require('../../../config/database');
const response = require('../../../utils/response');
const moment = require('moment');


module.exports.addTicketPackage = (req,res)=>{
    con.connect(function (err) {
        let sqlQuery = 'SELECT * FROM ev_to_add_ticket WHERE ticket_package =?';
        con.query(sqlQuery,[req.body.ticket_package],(err, data) => {
            if (err) {
                response.internalError(500,"Internal Error",res);
            }
            if (data.length > 0) {
                response.alreadyExist(201,"Ticket package already exist",res);
            }
            if (data.length == 0) {
                req.body.created_at = moment(new Date()).format("YYY-MM-DD hh:mm:ss");
                con.query('INSERT INTO ev_to_add_ticket SET ?', req.body, (err, data) => {
                    if (err) {
                        response.internalError(500,"Error in components:admin:controller:tickatPackageController:addTicketPackage",res);
                    } else {
                        response.success(200,"Ticket added successfully",data,res);
                    }

                })
            }

        })

    })

}

module.exports.getTicketPackage = (req,res)=>{

    con.connect(function (err) {
        let sqlQuery = 'SELECT * FROM ev_to_add_ticket';
        con.query(sqlQuery,[req.body.ticket_package],(err, data) => {
            if (err) {
                response.internalError(500,"Error in components:admin:controller:ticketPackageController:getTicketPackage",res);
            }
            if (data.length > 0) {
                var types = ["Paid","Donation","Free"];
                response.ticketPackage(200,"Ticket package type",data,types,res);
            }
        })
    })

}



module.exports.getTicketPackageById = (req,res)=>{
  
    con.connect(function (err) {
        let sqlQuery = 'SELECT * FROM ev_to_add_ticket WHERE id = ?';
        con.query(sqlQuery,[req.body.ticket_id],(err, data) => {
            if (err) {
                response.internalError(500,"Error in components:admin:controller:ticketPackageController:getTicketPackageById",res);
            }
            if (data.length > 0) {
                response.success(200,"Ticket package data",data,res);
            }
     
        })

    })

}

module.exports.updateTicketPackage = (req,res)=>{
    con.connect(function (err) {
        let sqlQuery = 'UPDATE  ev_to_add_ticket SET ticket_package = ? WHERE id = ?';
        con.query(sqlQuery,[req.body.ticket_package,req.body.ticket_id],(err, data) => {
            console.log("=====>>>>====error or data =====", err,data);
            if (err) {
                response.internalError(500,"Error in components:admin:controller:ticketPackageController:updateTicketPackage",res);
            }else{
                response.success(200,"Ticket package updated successfully",data,res);
    
            }
        })

    })
}

module.exports.deleteTicketPackage = (req,res)=>{
    con.connect(function (err) {
        let sqlQuery = 'DELETE FROM ev_to_add_ticket  WHERE id = ?';
        con.query(sqlQuery,[req.body.ticket_id],(err, data) => {
            console.log("=====>>>>====error or data =====", err,data);
            if (err) {
                response.internalError(500,"Error in components:admin:controller:ticketPackageController:deleteTicketPackage",res);
            }else{
                response.success(200,"Ticket package deleted successfully",data,res);
            }
     
        })
    })
}


module.exports.allTicketPackage = (req,res)=>{
    con.connect(function (err) {
        let sqlQuery = 'SELECT * FROM ev_to_add_ticket ';
        con.query(sqlQuery,(err, data) => {
            console.log("=====>>>>====error or data =====", err,data);
            if (err) {
                response.internalError(500,"Error in components:admin:controller:ticketPackageController:allTicketPackage",res);
            }else{
                var types = ["Paid","Free"];
                response.ticketPackage(200,"All Ticket package.",data,types,res);
            }
        })

    })

}

module.exports.ticketCount = (req,res)=>{
    con.connect(function (err) {
        let sqlQuery = 'SELECT COUNT(*) as total FROM ev_to_add_ticket ';
        con.query(sqlQuery,(err, count) => {
            if(err){
                response.internalError(500,"Error in components:admin:controller:ticketPackageController:ticketCount",res);
            }else{
             response.success(200,"Count of ticket",count,res);   
            }

        })
    })

}