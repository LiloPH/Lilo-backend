const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILER_AUTH_USER,
    pass: process.env.MAILER_AUTH_PASS,
  },
  timeout: 60000,
});

module.exports = transporter;
