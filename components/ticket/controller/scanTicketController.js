
const con = require('../../../config/database');
const moment = require('moment');
const response = require('../../../utils/response');

module.exports.checkTicket = (req, res) => {
    var params = req.body;
    var ticket_expire, ticket_id;
    var ticket_query;
    var getTicketDetail = new Promise((resolve, reject) => {
        con.connect(function (err) {
            if (params.type == "booking_id") {
                ticket_query = 'SELECT *  FROM  ev_to_users_ticket WHERE booking_id = ?' + params.booking_id;
                ticket_id = params.booking_id;
            }
            if (params.type == "qrcode") {
                ticket_query = 'SELECT *  FROM  ev_to_users_ticket WHERE qrcode = ?' + params.qrcode;
                ticket_id = params.qrcode;
            }
            con.query(ticket_query, (err, ticket) => {
                if (err) {
                    reject(err);
                } else {
                    var data;
                    if (event[0].end_date < moment(new Date()).format('YYYY-MM-DD')) {
                        data = {
                            isExpire: "true"
                        }
                        if (params.type == "booking_id") {
                            ticket_expire = "UPDATE ev_to_users_ticket SET isExpire='true' WHERE booking_id=?";
                            ticket_id = params.booking_id;
                        }
                        if (params.type == "qrcode") {
                            ticket_expire = "UPDATE ev_to_users_ticket SET isExpire='true' WHERE qrcode=?";
                            ticket_id = params.qrcode;
                        }
                        con.query(ticket_expire, [ticket_id],(err, expire) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        })
                    } else if (ticket[0].isUsed == "1") {
                        data = {
                            isUsed: "true"
                        }
                        resolve(data)
                    } else {
                        data = {
                            isUsed: "false",
                            isExpire: "false",
                            type: params.type,
                            ticket_id: ticket_id,
                            event_id: ticket[0].event_id
                        }
                        // return event ticket detail 
                        resolve(data);
                    }
                }

            })
        })
    })

    var checkUserTicket = (ticket) => {
        return new Promise((resolve, reject) => {
            let ticket_used;
            con.connect(function (err) {
                let query = "SELECT * FROM ev_to_add_event WHERE id=?";
                con.query(query, [ticket.event_id], (err, event) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (ticket.type == "booking_id") {
                            ticket_used = "UPDATE ev_to_users_ticket SET isUsed='true' WHERE booking_id=?";
                        }
                        if (ticket.type == "qrcode") {
                            ticket_used = "UPDATE ev_to_users_ticket SET isUsed='true' WHERE qrcode=?";
                        }
                        con.query(ticket_used, [ticket.ticket_id], (err, used) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(event);
                            }
                        })
                    }
                });
            });
        })
    }

    getTicketDetail.then((ticket) => {
        if (ticket.length > 0) {
            if (ticket.isUsed == "false") {
                ticket = {};
                response.internalError(400, "Ticket is used already", res);
            }
            if (ticket.isExpire == "false") {
                response.internalError(400, "Ticket is expired ", res);
            }
            if (ticket.isUsed == "false" && ticket.isExpire == "false") {
                return checkUserTicket(ticket);
            }
        }
    }).then((eventTicket) => {
        // send ticket detail after scanning qrcode or ticket //
        response.success(200, "Ticket checked or scanned successfully", eventTicket, res);
    }).catch((err) => {
        response.internalError(500, "Error components:ticket:controller:scanTicketControler:checkTicket",res);
    })

}