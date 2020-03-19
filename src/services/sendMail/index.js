/* istanbul ignore file */
import { createTransport } from "nodemailer";
import { loadEnv } from "../../lib";
import hbs from "nodemailer-express-handlebars";

loadEnv();

const Emailer = (mailList, url, template) => {
  let mailConfig;
  if (process.env.NODE_ENV === "test") {
    mailConfig = {
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "verysecret"
      }
    };
  } else {
    mailConfig = {
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    };
  }

  let transporter = createTransport(mailConfig)
  // let transporter = createTransport({
  //   host: 'smtp.mailgun.org',
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: process.env.MAIL_USER,
  //     pass: process.env.MAIL_PASS
  //   }
  // });

  transporter.use('compile', hbs({
    viewEngine: {
      partialsDir: 'templates/',
      layoutsDir: 'templates/',
      defaultLayout: '',
    },
    viewPath: 'src/services/sendMail/templates/',
    extName: '.handlebars'
  }))


  const mailOptions = {
    from: process.env.MAIL_USER,
    to: mailList,
    subject: "iLearn Africa",
    template,
    context: {
      url
    }
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export default Emailer;
