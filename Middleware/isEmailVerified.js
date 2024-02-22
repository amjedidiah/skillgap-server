const UserModel = require("../model/User/User")

const isEmailVerified = async (req, res, next) => {
   try{
    console.log("isEmailVerified", req.user)
      const user = await UserModel.findById(req.user);
     if(!user?.isEmailVerified){
      return res.status(401).json({
       message: "Action denied, email not verified"
       })
     }
     next()
   }
   catch(error){
       res.status(500).json({
        mesage: error.message
       })
   }
}

module.exports = isEmailVerified