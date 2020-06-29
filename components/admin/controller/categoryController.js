const con = require('../../../config/database');
const moment = require('moment');
const response = require('../../../utils/response');

module.exports.addCategory = (req, res) => {

    console.log("=== =daat from front end ===>>>", req.body);

    con.connect(function (err) {
   
        let sqlQuery = 'SELECT * FROM ev_to_category WHERE category =?';
        con.query(sqlQuery,[req.body.category],(err, data) => {
            console.log("==== error in 1111111 =======>>>", err);
            if (err) {
              response.internalError(500,"Error in components:admin:controller:categoryController:addCategory_1",res);
            }
            if (data.length > 0) {
              response.alreadyExist(201,"Category already exist",res);
            }
            if (data.length == 0) {
                req.body.created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
                con.query('INSERT INTO ev_to_category SET ?', req.body, (err, data) => {
                    console.log("==== print category from frontend  =====>>>",err,data);
                    if (err) {
                        response.internalError(500,"Error in components:admin:controller:categoryController:addCategory_2",res);
                    } else {
                        response.success(200,"Category added successfully",data,res);
                    }

                })
            }

        })

    })

}

module.exports.getCategory = (req, res) => {
    con.connect(function (err) {
        let sqlQuery = 'SELECT * FROM ev_to_category  WHERE id=' + req.body.category_id;
        con.query(sqlQuery, (err, data) => {
            if (err) {
                response.internalError(500,"Error in components:admin:controller:categoryController:getCategory",res);
            } else {
                response.success(200,"Category get successfully",data,res);
            }

        })
    })

}

module.exports.updateCategory = (req, res) => {
    con.connect(function (err) {
        let sqlQuery = 'UPDATE ev_to_category SET category ="' + req.body.category + '"WHERE id =' + req.body.category_id;
        con.query(sqlQuery, (err, data) => {
            if (err) {
                response.internalError(500,"Error in components:admin:controller:categoryController:updateCategory",res);
            } else {
                response.success(200,"Category updated successfully",data,res);
            }

        })
    })

}


module.exports.deleteCategory = (req, res) => {
    con.connect(function (err) {
        let sqlQuery = 'DELETE FROM ev_to_category WHERE id = "' + req.body.category_id + '"';
        con.query(sqlQuery, (err, data) => {
            if (err) {
                response.internalError(500,"Error in components:admin:controller:categoryController:deleteCategory",res);
            } else {
                response.success(200,"Category deleted successfully",data,res);
            }

        })
    })

}


module.exports.allCategory = (req, res) => {
    con.connect(function (err) {
        let sqlQuery = 'SELECT * FROM ev_to_category ORDER BY created_at DESC';
        con.query(sqlQuery, (err, data) => {
            if (err) {
                response.internalError(500,"Error in components:admin:controller:categoryController:allCategory",res);
            } else {
                var categories = [];
                categories = [...new Set(data.map((categories) => categories.category))];
                return res.json({
                    status: 200,
                    message: 'All category ',
                    categories: categories,
                    data:data
                })
            }

        })
    })

}

module.exports.categoryCount = (req,res)=>{
    con.connect(function (err) {
        let sqlQuery = 'SELECT COUNT(*) as total FROM ev_to_category';
        con.query(sqlQuery, (err, count) => {
            if(err){
                response.internalError(500,"Error in components:admin:categoryController:categoryCount",res);
            }else{
                response.success(200,"Category total count",count,res);
            }

        })
    })
}