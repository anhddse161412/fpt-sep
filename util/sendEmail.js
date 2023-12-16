const db = require("../models");
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = (email, subject, content) => {
   var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.EMAIL,
         pass: process.env.CRE_PASS,
      },
   });

   var mailOptions = {
      from: process.env.EMAIL,
      to: `${email}`,
      subject: subject,
      text: content,
   };

   transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
         console.log(error);
         return false;
      } else {
         return true;
      }
   });
};

module.exports = { sendEmail };
