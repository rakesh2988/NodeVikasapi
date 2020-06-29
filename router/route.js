module.exports = (app)=>{
require('../components/admin/routes/router')(app);
require('../components/user/routes/router')(app);
require('../components/payment/routes/router')(app);
require('../components/ticket/routes/router')(app);
require('../components/coupon/routes/router')(app);
}