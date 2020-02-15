/* istanbul ignore file */
const nodemailer = require("nodemailer");
require('dotenv').config()

module.exports = Emailer = (mailList, output) => {

  if(process.env.NODE_ENV === 'test'){
    
    mailConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'verysecret'
        }
      }
    } else {

    mailConfig = {
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    }
  }

  let transporter = nodemailer.createTransport(mailConfig);

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: mailList,
    subject: 'iLearn Africa',
    html: output
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
