const db = require("../models");
const nodemailer = require("nodemailer");

const sendEmail = (email, subject, content) => {
   var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: "anhddse161412@fpt.edu.vn",
         pass: "uxqo fytd eaps tkkz",
      },
   });

   var mailOptions = {
      from: "anhddse161412@fpt.edu.vn",
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
