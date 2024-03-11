const expressAsyncHandler = require('express-async-handler')
const { Magic } = require('@magic-sdk/admin');
const { validateJwt } = require('../utils/jwt');
const UserModel = require('../models/user');


const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
   const {email} = req.body
   console.log(email)
   const getAllUsers = await UserModel.find()
   console.log(getAllUsers)
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