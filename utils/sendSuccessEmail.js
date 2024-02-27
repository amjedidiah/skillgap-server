const nodemailer = require('nodemailer');
const path = require('path')
const hbs = require('nodemailer-express-handlebars');

const sendSuccessEmail = async (emailTo, emailSubject, firstName) => {
  try{
// configuring handlebars option
console.log("ran email success", emailTo, emailSubject, firstName)
 const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve('./Views'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./Views'),
  extName: ".handlebars",
}

    // create a transaporter 
const transporter= nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:"ukonulucky@gmail.com",
        pass:"usnk dsvz bkjt ktyp"
    }
})



transporter.use('compile', hbs(handlebarOptions));

var mailOptions = {
  from: 'Skill Gap',
  to: emailTo,
  subject: emailSubject,
  template: 'emailVerificationSuccess',
  context: {
     firstName
  }

};

const info = await transporter.sendMail(mailOptions)
console.log("email sent successfully", info.messageId)
  }catch(error){
 console.log(error.message)
  }

}

module.exports = sendSuccessEmail 