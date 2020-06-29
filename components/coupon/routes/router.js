const couponController = require('./../controller/couponController');

module.exports = (router)=>
{

    router.get('/coupon-event-names', couponController.couponEvents);
    router.post('/add-coupon',couponController.addCoupon); 
    router.post('/search-coupon',couponController.getCoupons);
    router.post('/apply-coupon',couponController.applyCoupon);
    router.post('/delete-coupon',couponController.deleteCoupon);
    
}