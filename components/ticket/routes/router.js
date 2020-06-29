
const ticketController = require('./../controller/ticketController');
const scanTicketController = require('./../controller/scanTicketController');
const checkOutController = require('./../controller/checkOutController');
const token = require('../../../utils/verifytoken');

module.exports = (app)=>{

app.post('/user-ticket',ticketController.userTicket);

app.post('/get-ticket',ticketController.getTicket);

app.post('/download-ticket', ticketController.downloadTicket);

app.post('/check-ticket',scanTicketController.checkTicket);

app.post('/avail-ticket',ticketController.availTicket);

app.post('/avail-ticket2',ticketController.availTicket2);

app.post('/ticket-total-service-tax',ticketController.ticketTotalWithServiceTax);

app.post('/check-out',checkOutController.checkOut);

}