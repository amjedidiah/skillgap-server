const nodemailer = require('nodemailer');


const sendPasswordChangeEmail = async (emailToSend,token) => {

  try{
    // create a transaporter 
const transaporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:"ukonulucky@gmail.com",
        pass:"usnk dsvz bkjt ktyp"

    }
})

// create message 

const message  = {
    to:emailToSend,
     subject: "Password Reset",
    html: `<p>Skill gap reset password verification  code which expires in 20 minutes.</p>
    <p>Pleas copy the password verification code =>> ${token}.<p>`
}

const info = await transaporter.sendMail(message)
console.log("email sent successfully", info.messageId)
  }catch(error){
 console.log(error.message)
  }

}

module.exports = sendPasswordChangeEmail