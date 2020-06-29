
const userEventController = require('./../controller/userEventController');
const signupController = require('./../controller/signupController');
const loginController = require('./../controller/loginController');
const forgotPasswordController = require('./../controller/forgotPasswordController');
const logoutController = require('./../controller/logoutController');
const authToken = require('../../../utils/verifytoken');

module.exports = (app)=>{
 
app.post('/user-signup',signupController.signup);

app.post('/user-login',loginController.login);

app.post('/search-event',userEventController.searchEvent);

app.get('/events',userEventController.getEvents);

app.post('/single-event',userEventController.getEvent);

app.post('/event-list',userEventController.eventList);

app.post('/event-list-bycategory',userEventController.eventListByCat);
app.post('/event-list-bycity',userEventController.eventListByCity);


app.post('/user-forgot-password',forgotPasswordController.forgotPassword);

app.get('/email-verify',loginController.verifyEmail);

app.post('/user-logout',logoutController.logout);

}