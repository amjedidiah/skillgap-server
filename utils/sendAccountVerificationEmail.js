const nodemailer = require('nodemailer');


const sendAccountVerificationEmail = async (emailToSend,token) => {

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
     subject: "Account Verification",
    html: `<p>You are receiving this mail because you or someone else has requested to verify your email address on skill gap</p>
    <p>Pleas click on the following link or place this into your browser to complete the process.<p>
    <a href="http://localhost:5173/account-verification-email/${token}">http://localhost:5173/account-verification-email/${token}<a>
    <p>Kindly ignore this mail if you did not request it.</p>
    `
}

console.log("email sent successfully 22",)
const info = await transaporter.sendMail(message)
console.log("email sent successfully", info)
  }catch(error){
 console.log(error.message)
  }

}

module.exports = sendAccountVerificationEmail