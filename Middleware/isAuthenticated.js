const expressAsyncHandler = require('express-async-handler')
const { validateJwt } = require('../utils/jwt');
const UserModel = require('../models/user');

const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
   const {email} = req.body
   const foundUser = await UserModel.findOne({email})
   console.log(foundUser)
   if(!foundUser){
   throw new Error("User not found")
   }
if(!foundUser.isLoggedIn){
   throw new Error("User not logged in")
}
   
req.user = foundUser
next()

})


module.exports = isAuthenticated