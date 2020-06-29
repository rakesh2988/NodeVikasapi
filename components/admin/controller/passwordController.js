const con = require('../../../config/database');
const response = require('../../../utils/response');
const md5 = require('md5');

module.exports.changePassword = (req, res) => {
    con.connect(function (err) {
        con.query('UPDATE  ev_to_signup SET password = ? WHERE id = ? ', [req.body.user_id, md5(req.body.password)], (err, data) => {
            if (err) {
                response.internalError(500, "Error in components:admin:controller:passwordController:chnagePassword", res);
            } else {
                response.success(200, "Password updated successfully", data, res);
            }
        })
    })

}

module.exports.forgotPassword = (req, res) => {
    con.connect(function (err) {
        con.query('SELECT * FROM ev_to_signup WHERE email = ?', [req.body.email], (err, data) => {
            if (err) {
                response.internalError(500, "Error in components:admin:controller:passwordController:forgotPassword",res);
            } else {
                response.success(200, "User email exist", data, res);
            }

        })

    })
}

