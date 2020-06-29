const con = require('../../../config/database');
const sendMailer = require('../../../helper/smtp');
const moment = require('moment');
const path = require('path');
const ejs = require('ejs');
const qrcode = require('qrcode');
const PDF = require('html-pdf');
const response = require('../../../utils/response');
const fs = require('fs');


module.exports.userTicket = (req, res) => {
    // user id event id 
    console.log("===========================================================================");
    console.log("------------------------------>>>>>=============>>>>>>", req.body);
    console.log("=============================================================================")
    var params = req.body;
    const qrOption = {
        margin: 7,
        width: 175
    };
    var CreateQrimage = new Promise((resolve, reject) => {  // use event id 

        const qrmoment = moment(new Date()).unix();
        const qrString = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8) + '_' + qrmoment;
        const booking_id = Math.random().toString(36).split('').filter(function (value, index, self) {
            return self.indexOf(value) === index;
        }).join('').substr(2, 8);
        (async () => {
            const bufferImage = await qrcode.toDataURL(qrString, qrOption);
            var imgData = bufferImage;
            var base64Data = imgData.replace(/^data:image\/png;base64,/, "");
            var ticket_dir = `public/qrImage/${params.event_name}`;
            if (!fs.existsSync(ticket_dir)) {
                await fs.mkdirSync(ticket_dir);

            }
            fs.writeFile(`public/qrImage/${qrmoment}.png`, base64Data, 'base64', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    params.qrcode = qrString;
                    params.qrimage = qrmoment;
                    params.booking_id = booking_id.toUpperCase();
                    params.created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
                    resolve(params);
                }
            });
        })();

    })

    var createTicket = (params) => {
        var userTicketData = {
            user_id: params.user_id,
            event_id: params.event_id,
            tickets: params.tickets,
            qrcode: params.qrcode,
            qrimage: params.qrimage,
            booking_id: params.booking_id,
            created_at: params.created_at
        }
        return new Promise((resolve, reject) => {
            con.connect(function (err) {
                con.query('INSERT INTO ev_to_users_ticket SET ?', userTicketData, (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(params);
                    }
                })
            })
        })
    }

    var createPdf = (params) => {
        return new Promise((resolve, reject) => {
            module.exports.createPDF(params, (callback) => {
                if (callback == "false") {
                    reject(callback);
                } else {
                    resolve(params);
                }
            })
        })
    }
    CreateQrimage.then((event) => {
        return createTicket(event);
    }).then((params) => {
        return createPdf(params);
    }).then((result) => {
        result.booking_id = params.booking_id;
        response.success(200, "Ticket created successfully", result, res);
    }).catch((err) => {
        response.internalError(500, "Error in components:ticket:controller:ticketController:userTicket", res);
    })

}


module.exports.createPDF = (params, callback) => {
    // Need package name to get event detail from ev_to_add_event and ev_to_ticket
    var EventData = new Promise((resolve, reject) => {
        con.connect(function (err) {
            // var event_query = "SELECT ev_to_add_event.* FROM ev_to_add_event INNER JOIN ev_to_ticket ON ev_to_add_event.id = ev_to_ticket.event_id WHERE ev_to_add_event.id = ? ";
            var event_query = "SELECT * FROM ev_to_add_event WHERE id = ? ";
            con.query(event_query, [params.event_id], (err, event) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(event);
                }
            })
        })
    })

    var UserTicketData = new Promise((resolve, reject) => {

        con.connect(function (err) {
            var ticket_query = "SELECT * FROM ev_to_users_ticket WHERE booking_id = ?";
            con.query(ticket_query, [params.booking_id.toUpperCase()], (err, ticket) => {
                if (err) {
                    reject(err);
                } else {
                    let sql_query = "UPDATE ev_to_users_ticket SET total=?,quantity =? WHERE booking_id = ? ";
                    con.query(sql_query, [params.total, params.quantity, params.tickets.toString(), params.booking_id.toUpperCase()], (err, total) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(ticket);
                        }
                    })
                }
            })
        })
    })

    EventData.then((event_data) => {
        if (event_data.length > 0) {
            UserTicketData.then((ticket_data) => {
                var compiled = ejs.compile(fs.readFileSync(__dirname + '/../../../templates/ticket.html', 'utf8'));
                var date_start = ('"' + moment(event_data[0].start_date).toDate().toDateString() + '"').split(" ")[1] + ' ' + moment(event_data[0].start_date).format("DD-YYYY");
                var html, hr, hr1;
                var newformat = event_data[0].start_time.split(':')[0] >= 12 ? 'PM' : 'AM';
                var newformat1 = event_data[0].end_time.split(':')[0] >= 12 ? 'PM' : 'AM';
                if (event_data[0].start_time.split(':')[0] > 12) {
                    hr = event_data[0].start_time.split(':')[0] - 12;
                }
                if (event_data[0].start_time.split(':')[0] < 12) {
                    hr = event_data[0].start_time.split(':')[0];
                }
                if (event_data[0].start_time.split(':')[0] == '00') {
                    hr = 12;
                }
                if (event_data[0].end_time.split(':')[0] > 12) {
                    hr1 = event_data[0].end_time.split(':')[0] - 12;
                }
                if (event_data[0].end_time.split(':')[0] < 12) {
                    hr1 = event_data[0].end_time.split(':')[0];
                }
                if (event_data[0].end_time.split(':')[0] == '00') {
                    hr1 = 12;
                }
                event_data[0].start_time = hr + ':' + event_data[0].start_time.split(':')[1] + ' ' + newformat;
                console.log("======= start time =====================", event_data[0].start_time);
                event_data[0].end_time = hr1 + ':' + event_data[0].end_time.split(':')[1] + ' ' + newformat1;
                console.log("=============>>>> date time ================", event_data[0].end_time);
                console.log("===== check ticket ==== type =======>>>>>>>>>>>>", params.tickets);
                html = compiled({
                    title: 'EVENTTICKETING',
                    text: 'Event Ticketing',
                    event_name: event_data[0].event_name,
                    thumbnail: event_data[0].thumbnail,
                    city: event_data[0].city,
                    state: event_data[0].state,
                    zipcode: event_data[0].zipcode,
                    start_date: date_start,
                    start_time: event_data[0].start_time,
                    end_time: event_data[0].end_time,
                    venue_name: event_data[0].venue_name,
                    service_tax: event_data[0].service_tax,
                    address: event_data[0].address,
                    ticket: params.tickets,
                    booking_id: params.booking_id,
                    quantity: params.quantity,
                    ticket_price: params.total,
                    qrimage: params.qrimage + ".png",
                    ticket_type: "Paid"
                });

                params.html = html;
                var ticket_dir;
                (async () => {
                    ticket_dir = `public/tickets/${event_data[0].event_name.toLowerCase()}`;
                    if (!fs.existsSync(ticket_dir)) {
                        await fs.mkdirSync(ticket_dir);
                    }
                })();

                PDF.create(html).toFile(`${ticket_dir}/${params.booking_id.toUpperCase()}.pdf`, (err, res) => {
                    if (err) {
                        callback("false");
                    }
                    else {
                        params.event_name = event_data[0].event_name,
                            module.exports.sendPDFTicket(params, (callback1) => {
                                console.log("=====***********************************************************=====", callback1)
                                if (callback1 == "false") {
                                    console.log(err);
                                    callback("false");
                                } else {
                                    return callback(params);
                                }
                            })
                    }
                });

            })
        }
    }).catch((err) => {
        console.log("= ========print error in catch statement ============", err);
        console.log(err);
    })

}


module.exports.sendPDFTicket = (data, callback1) => {
    var userEmail = new Promise((resolve, reject) => {
        con.connect(function (err) {
            var query = 'SELECT email FROM  ev_to_signup WHERE id = ?';
            con.query(query, [data.user_id], (err, user) => {
                if (user.length > 0) {
                    console.log("=== inside condition condition condition ==>>>>>>>>>")
                    resolve(user[0].email);
                } else {
                    reject(err);
                }
            })
        })
    })

    userEmail.then((email) => {
        var pdf_data = {
            subject: "Send pdf ticket on email",
            message: 'Ticket',
            event_name: data.event_name,
            html: data.html,
            booking_id: data.booking_id,
            type: "ticket"

        }
        sendMailer.send(email, pdf_data, pdf_data.type, (callback) => {
            if (callback == "false") {
                console.log("Error in sendMailer ====");
                callback1("false")
            } else {
                return callback1("true");
            }
        })
    }).catch((err) => {
        console.log(err);
    })

}

module.exports.getTicket = (req, res) => {
    var params = req.body;

    console.log("================= print  ================ get tiket====", params);
    // need event_id,booking_id

    var EventData = new Promise((resolve, reject) => {
        con.connect(function (err) {
            var query = 'SELECT * FROM  ev_to_add_event WHERE id = ?';
            con.query(query, [params.event_id], (err, event) => {
                console.log("==== print event data from ====>>>>======----", err, event)
                if (err) {
                    reject(err);
                } else {
                    resolve(event);
                }

            })
        })

    })





    EventData.then((event_data) => {
        if (event_data.length > 0) {

            con.connect(function (err) {
                var query;
                //params.type == "qrcode"

                if (params.type == "booking_id") {
                    query = 'SELECT * FROM  ev_to_users_ticket WHERE booking_id = ?';
                } else {
                    query = 'SELECT * FROM ev_to_users_ticket WHERE qrcode = ?';
                    params.booking_id = params.qrcode;
                }

                console.log("======== print params booking id ==========", params.booking_id);
                con.query(query, [params.booking_id], (err, booking) => {
                    console.log("=====111111111111111111111111=====111111111", err,booking,booking[0].qrimage);
                    if (err) {
                        response.internalError(500, "Error component:ticket:ticketController:getTicket", res);
                    } else {
                        var start = moment.utc(event_data[0].start_date, 'MMMM Do YYYY').toDate().toUTCString();
                        var date_start = start.split(':')[0].split(' ')[0] + " " + start.split(':')[0].split(' ')[1] + " " + start.split(':')[0].split(' ')[2] + " " + start.split(':')[0].split(' ')[3];

                        // var date_start = moment(event_data[0].start_date).toDate();
                        var hr;
                        var newformat = event_data[0].start_time.split(':')[0] >= 12 ? 'PM' : 'AM';
                        if (event_data[0].start_time.split(':')[0] > 12) {
                            hr = event_data[0].start_time.split(':')[0] - 12;
                        }
                        if (event_data[0].start_time.split(':')[0] < 12) {
                            hr = event_data[0].start_time.split(':')[0];
                        }
                        if (event_data[0].start_time.split(':')[0] == '00') {
                            hr = 12;
                        }
                        if (event_data[0].end_time.split(':')[0] > 12) {
                            hr = event_data[0].end_time.split(':')[0] - 12;
                        }
                        if (event_data[0].end_time.split(':')[0] < 12) {
                            hr = event_data[0].end_time.split(':')[0];
                        }
                        if (event_data[0].end_time.split(':')[0] == '00') {
                            hr = 12;
                        }
                        var start_time = hr + ':' + event_data[0].start_time.split(':')[1] + ' ' + newformat;
                        var end_time = hr + ':' + event_data[0].end_time.split(':')[1] + ' ' + newformat;
                        var data = {
                            event_name: event_data[0].event_name,
                            thumbnail: event_data[0].thumbnail,
                            start_date: date_start,
                            start_time: start_time,
                            end_time: end_time,
                            venue_name: event_data[0].venue_name,
                            address: event_data[0].address,
                            city: event_data[0].city,
                            state: event_data[0].state,
                            zipcode: event_data[0].zipcode,
                            ticket_type: event_data[0].ticket_package,
                            booking_id: params.booking_id,
                            qrimage: booking[0].qrimage +'.png'
                        }

                        response.success(200, "Data of Booking", data, res);
                    }

                })
            })
        }
    }).catch((err) => {
        console.log("===== final error in catch state of the function =========", err);
        response.internalError(500, "Error component:ticket:ticketController:getTicket", res);
    })
}






module.exports.availTicket = (req, res) => {
    var params = req.body;
    console.log("========== avail all ticket ==============================", params)
    var ticketDetails = [];
    con.connect(function (err) {
        var allTicket = new Promise((resolve, reject) => {
            var query = 'SELECT * FROM ev_to_ticket WHERE event_id = ?';
            con.query(query, [params.event_id], (err, event) => {
                console.log("============ 1111111111111111 ==============", err, event);
                if (err) {
                    reject(err);
                } else {
                    resolve(event);
                }

            })
        })

        checkTicketAvailability = (ids) => {
            console.log("=========== 22222222222222222============", ids);
            return new Promise((resolve, reject) => {
                function ticket(ids) {
                    var queryticket = 'SELECT * FROM ev_to_ticket WHERE id = ? AND is_sale_out = ?';
                    con.query(queryticket, [ids[0], false], (err, tickets) => {
                        console.log("========== 333333333333333============", err, tickets);
                        if (err) {
                            reject(err);
                        } else {
                            if (ids.length > 0) {
                                ticketDetails.push(tickets[0])
                                ids.shift();
                                ticket(ids);
                            } else {
                                resolve(ticketDetails);
                            }
                        }
                    })
                }
                if (ids.length > 0) {
                    ticket(ids);
                }
            })

        }

        allTicket.then((event_detail) => {
            console.log("=============== 44444444444 ====================", event_detail);
            if (event_detail.length > 0) {
                var package_ids = event_detail.map(ids => ids.id);
                package_ids.event_image = event_detail[0].event_image;
                return checkTicketAvailability(package_ids);
            } else {
                response.success(200, "No  Ticket is available", event_detail, res);
            }
        }).then((tickets) => {
            var setTicketDetail = [];
            con.query(`SELECT banner_image FROM ev_to_add_event WHERE id= ${params.event_id}`, (err, event) => {
                if (err) {
                    return response.internalError(500, "Internal error", res);
                } else {
                    tickets.forEach((ticket) => {
                        setTicketDetail.push({
                            package_id: ticket.id,
                            event_id: ticket.event_id,
                            name: ticket.ticket_package,
                            quantity: ticket.quantity,
                            free_quantity: ticket.free_quantity,
                            free_price: ticket.free_price,
                            paid_quantity: ticket.paid_quantity,
                            paid_price: ticket.paid_price,
                            price: ticket.price,
                            banner_image: event[0].banner_image
                        })
                    })

                    response.success(200, "Event Ticket Data", setTicketDetail, res);
                }
            })

        }).catch((err) => {
            console.log(err);
            response.internalError(500, "Error in components:user:controller:ticketController:availTicket", res);
        })

    })

}


module.exports.availTicket2 = (req, res) => {
    var params = req.body;
    con.connect(function (err) {
        var query = 'SELECT * FROM ev_to_add_event WHERE id = ?';
        con.query(query, [params.event_id], (err, event) => {
            if (err) {
                response.internalError(500, "Error in availTicket2 ", res);
            } else {
                response.success(200, "Event data", event, res);
            }
        })

    })


}



module.exports.ticketTotalWithServiceTax = (req, res) => {
    var params = req.body;
    con.connect(function (err) {
        var query = 'SELECT * FROM ev_to_add_event WHERE id = ?';
        con.query(query, [params.event_id], (err, event) => {
            console.log("===== print service tax =====>>>>============", event);
            if (err) {
                response.internalError(500, "Error in ticketTotalWithServiceTax ", res);
            } else {
                var total = 0;
                for (let i = 0; i < params.ticket.length; i++) {
                    total = total + params.ticket[i].total;
                }
                var net_total = total + (total * event[0].service_tax) / 100;
                event[0].net_total = net_total;
                response.success(200, "Event data", event, res);
            }
        })

    })

}




module.exports.downloadTicket = (req, res) => {
    // required event name and bookingid
    var params = req.body;
    console.log("====>>===>>>////=== download tickets====", req.body);
    res.download(path.join(__dirname, '/../../../public/tickets/fqwfqwfwq/8TMW1IKC.pdf'));
    // res.download(path.join(__dirname, `/../../../public/tickets/${params.event_name}/${params.booking_id}.pdf`));

}

