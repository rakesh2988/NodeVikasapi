
const adminController = require('../controller/loginController');
const adminEventController = require('./../controller/eventController');
const categoryController = require('./../controller/categoryController');
const ticketController = require('./../controller/ticketController');
const logoutController = require('../controller/logoutController');
const packageController = require('../controller/ticketPackageController');
const editProfileController = require('../controller/editProfileController');
const userController = require('../controller/userController');
const passwordController = require('../controller/passwordController');
const fileUpload = require('../../../helper/fileUpload');
const authUser = require('../../../utils/verifytoken');

module.exports = (app)=>{
     
app.post('/login',adminController.login);

//Events routes

app.post('/add-event',adminEventController.addEvent);
app.post('/event-image',fileUpload.any(),adminEventController.eventImage);
app.post('/banner-image',fileUpload.any(),adminEventController.bannerImage);

app.post('/slider-image1',fileUpload.any(),adminEventController.sliderImage)
app.post('/slider-image2',fileUpload.any(),adminEventController.sliderImage)
app.post('/slider-image3',fileUpload.any(),adminEventController.sliderImage)

app.post('/get-event',authUser.verifyToken,adminEventController.getEvent);
app.post('/get-event-slug',authUser.verifyToken,adminEventController.getEventBySlug);
app.post('/update-event',fileUpload.any(),adminEventController.updateEvent);
app.get('/event-count',authUser.verifyToken,adminEventController.eventCount); 



app.post('/all-event',authUser.verifyToken,adminEventController.getEvents);




app.post('/remove-event',authUser.verifyToken,adminEventController.removeEvent)

// Event ticket routes
app.post('/add-event-ticket',ticketController.addTicket);
app.post('/get-event-ticket',authUser.verifyToken,ticketController.getTicketBYPackage);
app.post('/update-event-ticket',ticketController.updateTicket);
app.post('/all-event-tickets',ticketController.allTickets);

//Category routes
app.post('/add-category',categoryController.addCategory);
app.post('/get-category',authUser.verifyToken,categoryController.getCategory);
app.get('/category-count',authUser.verifyToken,categoryController.categoryCount);
app.post('/update-category',authUser.verifyToken,categoryController.updateCategory);
app.post('/remove-category',authUser.verifyToken,categoryController.deleteCategory);
app.get('/all-categories',authUser.verifyToken,categoryController.allCategory);

// Ticket routes
app.post('/add-ticket-package',authUser.verifyToken,packageController.addTicketPackage);
app.get('/get-ticket-packages',authUser.verifyToken,packageController.getTicketPackage);
app.post('/get-ticket-package',authUser.verifyToken,packageController.getTicketPackageById);
app.post('/update-ticket-package',authUser.verifyToken,packageController.updateTicketPackage)
app.post('/delete-ticket-package',authUser.verifyToken,packageController.deleteTicketPackage);
app.get('/all-ticket-packages',authUser.verifyToken,packageController.allTicketPackage);
app.get('/ticket-count',authUser.verifyToken,packageController.ticketCount);

//User routes
app.post('/all-users',authUser.verifyToken,userController.getUsers);
app.get('/user-count',authUser.verifyToken,userController.userCount);
app.post('/get-user',authUser.verifyToken,userController.getUser);
app.post('/user-status',authUser.verifyToken,userController.changeStatus);
app.post('/update-user',authUser.verifyToken,userController.updateUser);
app.post('/remove-user',authUser.verifyToken,userController.deleteUser);

//Password routes
app.post('/forgot-password',passwordController.forgotPassword);
app.post('/change-password',passwordController.changePassword);

// Profile routes
app.post('/edit-profile',authUser.verifyToken,editProfileController.editProfile);
app.post('/admin-profile',authUser.verifyToken,editProfileController.getAdminProfile);


app.post('/logout',logoutController.logout);

}