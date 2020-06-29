const con = require('../../../config/database');
const response = require('../../../utils/response');
const moment = require('moment');



module.exports.updateEventMinMaxPrice = (event_id,callback)=>{
    con.connect(function (err) {
        con.query('SELECT * FROM ev_to_ticket WHERE event_id= "'+ event_id, (err, data) => {
            if (err) {
             callback("false")
            }else{
                if(data.length > 0){
                    var prices = data.map((ticket)=>ticket.price);
                    let sqlQuery = 'UPDATE ev_to_add_event SET  min_price = ?,max_price= ? WHERE event_id = ? ' ;
                    con.query(sqlQuery,[Math.min(prices),Math.max(prices),event_id], (err, data) => {
                        if (err) {
                            callback("false")
                        }else{
                            callback("true")
                        }
                    })

                }
            }

        })

    })

}

module.exports.addTicket = (req, res) => {
    console.log("==============================================================================================")
    console.log("========================>>>>>>>>>>>>>>>>>>>>>>",req.body);
    console.log("=============================================================================================")
    
    con.connect(function (err) {

        // con.query('SELECT * FROM ev_to_ticket WHERE event_id= "'+ req.body.event_id+'" AND  ticket_package = "' + req.body.ticket_package +'"', (err, data) => {
            con.query('SELECT * FROM ev_to_ticket WHERE event_id= ?',[req.body.event_id], (err, data) => {    
                console.log("============ error or data ===========",err,data);
        if (err) {
             response.internalError(500,"Internal Error",res);
            }
            if (data.length > 0) {
                // response.alreadyExist(201,"Ticket type already exist",res);
                var value = [req.body.free_quantity,req.body.paid_quantity,req.body.paid_price,req.body.event_id];
                con.query('UPDATE ev_to_ticket SET free_quantity =?, paid_quantity = ?, paid_price=? WHERE event_id=?',value, (err, data) => {
                   console.log("===============error === data =============",err,data);
                    if (err) {
                        response.internalError(500,"Error in components:admin:controller:ticketController:addTicket",res);
                    } else {
                        response.success(200,"Ticket added successfully",data,res);
                       
                    }

                })
            }
            if (data.length == 0) {
                req.body.created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
                
                con.query('INSERT INTO ev_to_ticket SET ?', req.body, (err, data) => {
                    console.log("============== free paid =============================>>>>>>",err,data);
                    if (err) {
                        response.internalError(500,"Error in components:admin:controller:ticketController:addTicket",res);
                    } else {
                        response.success(200,"Ticket added successfully",data,res);
                       
                    }

                })
            }

        })
    })

}

module.exports.updateTicket = (req, res) => {
    console.log("=== pint all ticket updated data from frontend  ======", req.body);
    con.connect(function (err) {
        let sql = 'SELECT * FROM ev_to_ticket WHERE event_id = "'+ req.body.event_id+'" AND ticket_package = "'+ req.body.ticket_package+'" ' ;
        con.query(sql,(err,data)=>{
            if(err){
                response.internalError(500,"Internal Error",res);  
            }
            if(data.length > 0){
                let sqlQuery = 'UPDATE ev_to_ticket SET  ticket_type = ?,quantity= ?, price= ? WHERE event_id = ? AND ticket_package = ?' ;
                con.query(sqlQuery,[req.body.ticket_type,req.body.quantity,req.body.price,req.body.event_id,req.body.ticket_package], (err, data) => {
                    if (err) {
                        response.internalError(500,"Error in components:admin:controller:ticketController:updateTicket",res);
                    } else {
                        response.success(200,"Ticket updated successfully",data,res);
                    }
        
                })
            }
            if(data.length == 0){
                req.body.created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
                con.query('INSERT INTO ev_to_ticket SET ?', req.body, (err, data) => {
                    console.log("== = print erro or data in ticket update  ===>>>>", err,data)
                    if (err) {
                        response.internalError(500,"Error in components:admin:controller:ticketController:updateticket",res);
                    } else {
                        response.success(200,"Ticket updated successfully",data,res);
                    }

                }) 
            }
        })
 
    })

}


module.exports.getTicketBYPackage = (req, res) => {
    con.connect(function (err) {
        let sqlQuery = 'SELECT * FROM ev_to_ticket WHERE event_id = "'+ req.body.event_id+'" AND ticket_package = "'+ req.body.ticket_package+'" ' ;
       
        con.query(sqlQuery, (err, data) => {
            if (err) {
                response.internalError(500,"Error in components:admin:controller:ticketController:getTicketBYPackage",res);
            } else {
                response.success(200,"Ticket data",data,res);
            }

        })
    })

}


module.exports.allTickets = (req, res) => {

    con.connect(function (err) {
        let sqlQuery = 'SELECT * FROM ev_to_ticket WHERE event_id=?';
        con.query(sqlQuery,[req.body.event_id],(err, data) => {
            if (err) {
                response.internalError(500,"Internal Error",res);
            } else {
                var packages = [];
                packages = data.map(pack =>pack.ticket_package);
                var types = [];
                types = data.map(type => type.ticket_type);
                console.log("====check ticket types ====", types);
                var categories = ["","Sports","Business","Educational","Medical","Other"];
                return res.json({
                    status: 200,
                    message: 'All tickets',
                    packages: packages,
                    types: types,
                    categories:categories,
                    data:data
                })
            }

        })
    })

}