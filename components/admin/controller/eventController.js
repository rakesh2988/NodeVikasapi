const con = require('../../../config/database');
const moment = require('moment');
const response = require('../../../utils/response');
const imageResize = require('../../../helper/resizeImage');

module.exports.addEvent = (req, res) => {

    console.log("==========>>>>>>=====>>>>>=====", req.body);
    if(!req.body.banner_image){
        req.body.banner_image = "default-banner.jpg";
    }
    if(!req.body.event_image){
        req.body.event_image = "default-image.jpg";
    }
    if(!req.body.slider_image1){
        req.body.slider_image1 = "default-slider1.jpg";
    }
    if(!req.body.slider_image2){
        req.body.slider_image2 = "default-slider2.jpg";
    }
    if(!req.body.slider_image3){
        req.body.slider_image3 = "default-slider3.jpg";
    }

    con.connect(function (err) {
        con.query(`SELECT * FROM ev_to_add_event WHERE event_name = ?`, [req.body.event_name], (err, event) => {
            if (err) {
                response.internalError(500, "Error in components:admin:controller:eventController:addEvent_2", res);
            } else {
                if (event.length == 0) {
                    req.body.event_slug = req.body.event_name + moment(new Date()).unix() * 1000;
                    req.body.created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
                    con.query('INSERT INTO ev_to_add_event SET ?', req.body, (err, data) => {
                        if (err) {
                            response.internalError(500, "Error in components:admin:controller:eventController:addEvent_2", res);
                        } else {
                            response.success(200, "Event added successfully", data, res);
                        }
                    });
                }
                if (event.length > 0) {
                    response.internalError(403, "Event is already exist", res);
                }

            }
        })


    })

}


module.exports.getEvents = (req, res) => {
    var totalCount = new Promise((resolve, reject) => {
        var countQuery = "SELECT count(*) as total FROM ev_to_add_event";
        con.connect(function (err) {
            con.query(countQuery, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }

            })
        })

    })

    var searchData = (count) => {
        return new Promise((resolve, reject) => {
            var params = req.body;
            params.limit = 10;
            var query;
            value = [];
            var offset = (params.page || 1) * params.limit - params.limit;
            if (params.text == '' && params != {}) {
                query = "SELECT ev_to_add_event.* , ev_to_category.category FROM ev_to_add_event inner join ev_to_category on ev_to_add_event.event_category_id= ev_to_category.id ORDER BY ev_to_add_event.created_at DESC LIMIT ? OFFSET ?";
                value = [params.limit, offset];
            }
            if (params.text !== '' && params != {}) {
                query = "SELECT ev_to_add_event.* , ev_to_category.category FROM ev_to_add_event inner join ev_to_category on ev_to_add_event.event_category_id= ev_to_category.id WHERE ev_to_add_event.event_name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
                value = [`${params.text}%`, params.limit, offset];
            } else {
                query = "SELECT ev_to_add_event.* , ev_to_category.category FROM ev_to_add_event inner join ev_to_category on ev_to_add_event.event_category_id= ev_to_category.id ORDER BY ev_to_add_event.created_at DESC LIMIT ? OFFSET ?";
                value = [params.limit, offset];
            }

            con.connect(function (err) {
                con.query(query, value, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        data.total = count[0].total;
                        data.limit = params.limit;
                        resolve(data)
                    }
                })
            })

        })

    }

    totalCount.then((count) => {
        return searchData(count);
    }).then((data) => {
        var newData = {
            data: data,
            limit: data.limit,
            size: Math.ceil(data.total / data.limit),
            total: data.total
        }
        response.success(200, "List of events", newData, res);
    }).catch((err) => {
        response.internalError(500, "Error components:admin:controller:eventController:getEvents", res);
    })

}

module.exports.getEvent = (req, res) => {
    con.connect(function (err) {
        let query = 'SELECT * FROM ev_to_add_event WHERE id = "' + req.body.event_id + '"';
        con.query(query, (err, data) => {
            if (err) {
                response.internalError(500, "Internal error", res);
            } else {
                let query = 'SELECT * FROM ev_to_ticket WHERE event_id = "' + req.body.event_id + '"';
                con.query(query, (err, ticket) => {
                    if (err) {
                        response.internalError(500, "Error components:admin:controller:eventController:getEvent", res);
                    } else {
                        return res.json({
                            status: 200,
                            message: "Event data ",
                            data: data,
                            ticket: ticket

                        })
                    }

                })

            }
        })

    })

}


module.exports.getEventBySlug = (req, res) => {
    con.connect(function (err) {
        let query = 'SELECT * FROM ev_to_add_event WHERE event_slug = "' + req.body.event_slug + '"';
        con.query(query, (err, data) => {
            console.log("==== print data data data ================>>>>>>>>>====",data);
            if (err) {
                response.internalError(500, "Internal error", res);
            } else {
                response.success(200, "Event data", data, res);
            }
        })

    })

}

module.exports.updateEvent = (req, res) => {
    console.log("==== check edit event data ==== >>>>>======//////", req.body);
    con.connect(function (err) {
        let query = 'UPDATE ev_to_add_event SET event_name= ?,tickets=?,max_price=?,min_price=?,service_tax=?,tax=?,event_title= ? ,venue_name = ?,' +
            'address =?, city=?,state=?,country=?,zipcode=?,start_date=?,end_date=?, start_time=?,end_time=?,lat=?,lng=?,description=?,' +
            'event_category_id=? WHERE id = ?';
        con.query(query, [req.body.event_name,req.body.tickets,req.body.max_price,req.body.min_price,req.body.service_tax,req.body.tax,req.body.event_title, req.body.venue_name, req.body.address, req.body.city,
        req.body.state, req.body.country, req.body.zipcode, req.body.start_date, req.body.end_date,
        req.body.start_time, req.body.end_time , req.body.lat , req.body.lng, req.body.description, req.body.event_category, req.body.event_id]
            , (err, data) => {
                console.log("===== print error or data data data data ============",err,data);
                if (err) {
                    response.internalError(500, err, res);
                } else {
                    response.success(200, "Event data", data, res);
                }
            })

    })

}


module.exports.removeEvent = (req, res) => {
    con.connect(function (err) {
        let query = 'DELETE FROM ev_to_add_event WHERE id = ?';
        con.query(query, [req.body.event_id], (err, data) => {
            if (err) {
                response.internalError(500, "Internal error", res);
            } else {
                let query = 'DELETE FROM ev_to_ticket WHERE event_id = ?';
                con.query(query, [req.body.event_id], (err, result) => {
                    if (err) {
                        response.internalError(500, "Error in components:admin:controller:eventController:removeEvent", res);
                    } else {
                        response.success(200, "Event data removed", data, res);
                    }

                })

            }
        })
    })
}


module.exports.eventCount = (req, res) => {
    console.log("===== print header to check ====", req.headers)
    con.connect(function (err) {
        let query = 'SELECT COUNT(*) as total FROM ev_to_add_event';
        con.query(query, [req.body.event_id], (err, count) => {
            if (err) {
                response.internalError(500, "Error in components:admin:controller:eventController:eventCount", res);
            } else {
                response.success(200, " Events count", count, res);
            }
        })
    })

}


module.exports.eventImage = (req, res) => {
    req.body.event_image = req.files[req.files.length - 1].filename;
    console.log("======>>>>====>> event image", req.files[req.files.length - 1]);
    console.log("======>>>>====>> event image file data body body ===", req.body)
    con.connect(function (err) {

        imageResize.resizeImage(req.files[req.files.length - 1], (callback1) => {
            if (callback1 == "error") {
            } else {
                imageResize.resizeEventImage(req.files[req.files.length - 1], "event_image", (callback2) => {
                    if (callback2 == "error") {
                    } else {
                        req.body.thumbnail = callback1;
                        req.body.event_image = callback2;
                        var query = `UPDATE ev_to_add_event SET event_image = ? , thumbnail = ? WHERE id = ?`;
                        con.query(query, [req.body.event_image, req.body.thumbnail, req.body.event_id], (err, data) => {
                            if (err) {
                                response.internalError(500, "Error in components:admin:controller:eventController:eventImage", res);
                            } else {

                                response.success(200, " Event image", data, res);
                            }
                        })
                    }
                })

            }

        })

    })
}

module.exports.bannerImage = (req, res) => {
    req.body.banner_image = req.files[req.files.length - 1].filename;
    console.log("======>>>>====>> banner image file data ===", req.files);
    console.log("======>>>>====>> banner image file data body body ===", req.body)
    con.connect(function (err) {
        imageResize.resizeEventImage(req.files[req.files.length - 1], "banner_image", (callback) => {
            if (callback == "error") {
            } else {
                var query = `UPDATE ev_to_add_event SET banner_image = ? WHERE id = ?`;
                req.body.banner_image = callback;
                con.query(query, [req.body.banner_image, req.body.event_id], (err, data) => {
                    if (err) {
                        response.internalError(500, "Error in components:admin:controller:eventController:bannerImage", res);
                    } else {
                        response.success(200, " Banner image", data, res);
                    }
                })
            }
        })

    })
}

module.exports.sliderImage = (req, res) => {
    console.log("===== >>>> slider image  ====", req.body, req.files);
    req.body.slider_image = req.files[req.files.length - 1].filename;
    con.connect(function (err) {
        imageResize.resizeEventImage(req.files[req.files.length - 1], "slider", (callback) => {
            if (callback == "error") {
            } else {
                var query;
                if (req.body.type == "1") {
                    query = `UPDATE ev_to_add_event SET slider_image1 = ? WHERE id = ?`;
                }
                if (req.body.type == "2") {
                    query = `UPDATE ev_to_add_event SET slider_image2 = ? WHERE id = ?`;
                }
                if (req.body.type == "3") {
                    query = `UPDATE ev_to_add_event SET slider_image3 = ? WHERE id = ?`;
                }
                req.body.slider_image = callback;
                con.query(query, [req.body.slider_image, req.body.event_id], (err, data) => {
                    if (err) {
                        response.internalError(500, "Error in components:admin:controller:eventController:slderImage", res);
                    } else {
                        response.success(200, "Slider image", data, res);
                    }
                })
            }
        })

    })

}

