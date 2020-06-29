const con = require('../../../config/database');
const response = require('../../../utils/response');
const moment = require('moment');
const _ = require('lodash');


module.exports.couponEvents = (req, res) => {

    var event_names = [];
    con.connect(function (err) {
        var event_query = `SELECT event_name,id FROM ev_to_add_event WHERE start_date >= ? ORDER BY start_date ASC `;
        con.query(event_query, [moment(new Date()).format('YYYY-MM-DD')], (err, data) => {
            if (err) {
                response.internalError(500, "Error in components:coupon:controller:couponController", res);
            } else {
                data.map((e) => {
                    event_names.push({ id: e.id, name: e.event_name });
                });
                response.success(200, "Event name List", event_names, res);
            }

        })

    })


}



module.exports.addCoupon = (req, res) => {

    var params = req.body;
    params.coupon_code = req.body.coupon_code.toUpperCase();
    con.connect(function (err) {
        var event_query = `SELECT * FROM ev_to_coupon WHERE  event_id=? AND coupon_code = ? `;

        con.query(event_query, [params.event_id, params.coupon_code], (err, coupon) => {
            if (err) {
                response.internalError(500, "Error in components:coupon:controller:couponController", res);
            } else {
                if (coupon.length == 0) {
                    params.coupon_slug = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8) + moment(new Date()).unix() * 1000;
                    params.created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
                    con.query('INSERT INTO ev_to_coupon SET ?', params, (err, data) => {
                        if (err) {
                            response.internalError(500, "Error in components:coupon:controller:couponController", res);
                        } else {
                            response.success(200, "Coupon generated successfully ", data, res);
                        }

                    })
                }
                if (coupon.length > 0) {
                    response.internalError(500, "Coupon code is already exist", res);
                }

            }

        })

    })


}


module.exports.getCoupons = (req, res) => {
    console.log("==== print search data of coupon ====>>>",req.body.text);
    var totalCount = new Promise((resolve, reject) => {
        var countQuery = "SELECT count(*) as total FROM ev_to_coupon";
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

            console.log("===== print params ======>>>>>=====",params);
            params.limit = 10;
            var query;
            value = [];
            var offset = (params.page || 1) * params.limit - params.limit;

            if (params.text) {
                query = `SELECT * FROM ev_to_coupon WHERE event_name OR coupon_code  LIKE ${params.text}%  ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}`;
                console.log("=== in param text ========>>>>",params.text);
            } else {
                query = `SELECT * FROM ev_to_coupon ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}`;
            }

            con.connect(function (err) {
                con.query(query, (err, data) => {
                    console.log("=== print coupon code ===>>>>===== error or data ======",err, data);
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
            size: Math.ceil(data.total / data.limit),
            limit: data.limit,
            total: data.total
        }
        response.success(200, "List of events", newData, res);
    }).catch((err) => {
        console.log(err);
        response.internalError(500, "Error in components:admin:controller:userController:getCoupons", res);
    })

}


module.exports.applyCoupon = (req, res) => {
    var error_message = '';
    console.log("===========================================================================================")
    console.log("==== print data of coupon code in backend after getting detail ==", req.body);
    console.log("==================================================================================================")

    //event_id, user_id,coupon_code, total
    var params = req.body;
    con.connect(function (err) {
        var update_coupon, value;
        var getCoupon = new Promise((resolve, reject) => {
            var event_query = `SELECT * FROM ev_to_coupon WHERE  event_id=? AND coupon_code = ? `;
            con.query(event_query, [params.event_id, params.coupon_code], (err, coupon) => {
                if (err) {
                    error_message = {
                        status: 500,
                        message: 'Internal error'
                    }
                    reject(error_message);
                } else {
                    if (coupon.length > 0) {
                        var coupon_date = moment(new Date(coupon[0].coupon_expire_date)).format('YYYY-MM-DD');
                        var current_date = moment(new Date()).format('YYYY-MM-DD');
                        if (current_date > coupon_date) {
                            update_coupon = `UPDATE  ev_to_coupon SET is_expire = ? WHERE  event_id=? AND coupon_code = ? `;
                            value = ["true", params.event_id, params.coupon_code];
                            con.query(update_coupon, value, (err, expire) => {
                                if (err) {
                                    error_message = {
                                        status: 500,
                                        message: 'Internal error'
                                    }
                                    reject(error_message);
                                } else {
                                    error_message = {
                                        status: 401,
                                        message: "Coupon is expired"
                                    }
                                    reject(error_message);
                                }
                            })
                        }

                        if (coupon_date >= current_date) {
                            if (coupon[0].coupon_limit > 0) {
                                resolve(coupon);
                            } else {
                                error_message = {
                                    status: 402,
                                    message: "Coupon limit is finished"
                                }
                                reject(error_message);
                            }

                        }
                    } else {
                        error_message = {
                            status: 404,
                            message: 'Coupon not found'
                        }
                        reject(error_message);
                    }
                }
            })

        })

        function applyCouponCode(coupon) {
            return new Promise((resolve, reject) => {
                var coupon_query = `SELECT * FROM ev_to_apply_coupon WHERE  event_id=? AND user_id = ? AND coupon_code = ? `;
                con.query(coupon_query, [params.event_id, params.user_id, params.coupon_code], (err, use) => {
                    if (err) {
                        error_message = {
                            status: 500,
                            message: 'Internal error'
                        }
                        reject(error_message);
                    } else {
                        if (use.length > 0) {
                            error_message = {
                                status: 403,
                                message: 'Coupon is already used'
                            }
                            reject(error_message);
                        } else {
                            var amount = params.total - ((params.total * coupon[0].coupon_discount) / 100);
                            var data = {
                                event_id: params.event_id,
                                user_id: params.user_id,
                                coupon_code: params.coupon_code,
                                coupon_slug: params.coupon_code + moment(new Date()).unix() * 1000,
                                created_at: moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
                            }
                            con.query('INSERT INTO ev_to_apply_coupon SET ?', data, (err, data) => {
                                if (err) {
                                    error_message = {
                                        status: 500,
                                        message: 'Internal error'
                                    }
                                    reject(error_message);
                                } else {
                                    update_coupon = `UPDATE  ev_to_coupon SET coupon_limit=? WHERE  event_id=? AND coupon_code = ? `;
                                    value = [coupon[0].coupon_limit - 1, params.event_id, params.coupon_code];
                                    con.query(update_coupon, value, (err, expire) => {

                                        if (err) {
                                            error_message = {
                                                status: 500,
                                                message: 'Internal error'
                                            }
                                            reject(error_message);
                                        } else {
                                            resolve(amount);
                                        }
                                    })

                                }

                            })
                        }
                    }

                })

            })

        }


        function updateCouponCode(amount) {
            return new Promise((resolve, reject) => {
                var coupon_usage = `UPDATE ev_to_apply_coupon SET is_used = ? WHERE  event_id=? AND user_id = ? AND coupon_code = ? `;
                con.query(coupon_usage, ["true", params.event_id, params.user_id, params.coupon_code], (err, use) => {
                    if (err) {
                        error_message = {
                            status: 500,
                            message: 'Internal error'
                        }
                        reject(error_message);
                    } else {
                        resolve(amount);
                    }

                })

            })

        }

        getCoupon.then((coupon) => {
            if (coupon.length > 0) {
                return applyCouponCode(coupon);
            }
        }).then((amount) => {
            return updateCouponCode(amount);
        }).then((data) => {
            response.success(200, "Amount after discount", data, res);
        }).catch((err) => {
            response.internalError(err.status, err.message, res);
        })
    })

}


module.exports.deleteCoupon = (req, res) => {
    var params = req.body;
    con.connect(function (err) {
        let query = 'DELETE FROM ev_to_coupon WHERE id = ?';
        con.query(query, [params.coupon_id], (err, data) => {
            if (err) {
                response.internalError(500, "Error components:coupon:couponController", res);
            } else {
                response.success(200, "Coupon data removed", data, res);
            }
        })
    })

}