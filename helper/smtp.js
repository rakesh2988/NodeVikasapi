
const path = require('path')
const nodemailer = require('nodemailer');
const appRoot = require('app-root-path');
const smtpTransport = require('nodemailer-smtp-transport')
const emailConfig = require('config').get('email')

module.exports.send = (to,data, type,callback) => {
    var mailOptions;
    const mailTransporter = nodemailer.createTransport({
        host: emailConfig.service,
        port: emailConfig.port,
        secure: false,
        auth: {
            user: emailConfig.auth.user,
            pass: emailConfig.auth.password
        }
    })

    if (type == "verify") {
        mailOptions = {
            from: emailConfig.auth.user,
            to: to,
            subject: data.subject,
            text: data.message,
            html: `<html>
            <h3>Here is login password</h3>
            <p>Password: ${data.text} <p>
            <a href='${data.url}'>${data.url}</a>
            </html>`
        }
    }

    if (type == "ticket") {

        mailOptions = {
            from: emailConfig.auth.user,
            to: to,
            subject: data.subject,
            text: data.message,
            html: data.html
            // html: `<html><h1>Event Ticket</h1></html>`
        }

        mailOptions.attachments = [{
            filename:'event-ticket.pdf',
            path: path.join(appRoot.path, `/public/tickets/${data.event_name.toLowerCase()}/${data.booking_id}.pdf`)
        }]


    }

    mailTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            callback("false");
        } else {
            console.log("=====done email send ======")
            callback("true");
        }

    });

}

