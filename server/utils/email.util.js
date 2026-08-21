// Modules
const nodemailer = require("nodemailer");

// -------------------------------------IMPORTS-------------------------------------

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT ? process.env.MAIL_PORT : 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// Function to send email to user
const sendMail = async (to, subject, html) => {
    await transporter.sendMail({
        from: "Online Market - DevSpace",
        to,
        subject,
        html
    });
};

module.exports = sendMail;