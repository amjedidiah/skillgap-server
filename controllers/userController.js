const passport = require("passport");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");


const crypto = require("crypto");
const sendAccountVerificationEmail = require("../utils/sendAccountVerificationEmail");
const sendPasswordChangeEmail  = require("../utils/sendPasswordChangeEmail");

const userRegisterController = expressAsyncHandler(async (req, res) => {
  try {
    console.log(req.body)
    const { firstName, lastName, email, phoneNumber, region, password, userName } = req.body
    if(!firstName || !email || !phoneNumber || !region || !password | !userName || !lastName) {
      throw new Error("Missing credentials");
    }
    const doesUserExist = await UserModel.findOne({
      email
    });

    if (doesUserExist) {
      throw new Error("Email already exist");
    }
    const doesUserNameExist = await UserModel.findOne({
      userName
    });
    if (doesUserNameExist) {
      throw new Error("User name already taken ");
    }
    
    // Hash the password with the generated salt
 const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await UserModel.create({
      ...req.body, password: hashedPassword,  skillGapTag: userName
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: newUser._id,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});


// user login
const userLoginController = expressAsyncHandler(async (req, res, next) => {
  console.log(req.body)
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });
    // set jwt token for the user
    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET);
   
    // set cookie

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // cookie will expire in 24 hours
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    return res.status(201).json({
      status: "success",
      message: "Login successful",
      id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      skillGapTag: user?.skillGap,
      userName: user?.userName,
      email: user?.email,
      region: user?.region,
      profilePic: user?.profilePic,
      isEmailVerified: user?.isEmailVerified
      
    });
  })(req, res, next);
});

const depositUser = expressAsyncHandler(async (req, res) => {
  try {
    const { amount, balance } = req.body;
    const { id } = req.params;
    const time = Date.now();
    const transactionType = "deposit";

    const findUser = await UserModel.findById(id);
    if (findUser) {
      const newBalance = parseFloat(amount) + parseFloat(findUser.balance);
      const data = {
        amount,
        newBalance,
        time,
        transactionType,
      };
      console.log(findUser.deposits);
      findUser.deposits.push(data);
      findUser.balance = newBalance;
      await findUser.save();
      res.status(200).json({
        message: "deposit successful",
        data: findUser,
      });
    } else {
      res.status(501).json({
        message: "deposit not successful",
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

const withdrawUser = expressAsyncHandler(async (req, res) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;
    const time = Date.now();
    const transactionType = "deposit";

    const findUser = await UserModel.findById(id);
    if (findUser) {
      if (findUser.balance < amount) {
        throw new Error("insufficient balance in account");
      }
      const newBalance = findUser.balance - amount;
      const data = {
        amount,
        newBalance,
        time,
        transactionType,
      };
      console.log(findUser.deposits);
      findUser.balance = newBalance;
      findUser.withdrawal.push(data);

      await findUser.save();
      res.status(200).json({
        message: "withdrawal successful",
        data: findUser,
      });
    } else {
      res.status(501).json({
        message: "witdrawal not successful",
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
});


const userProfileUpdateController = expressAsyncHandler(async(req, res) => {
    const {firstName, lastName,skillGapTag, region, phoneNumber, password} = req.body
   
      if( !firstName && !lastName && !skillGapTag && !req.file ) {
           throw new Error("User profile update failed")
      }
      // find user
const user = await UserModel.findOne({skillGapTag}) //
 if(!user){
   throw new Error("User not found")
 }

    const updateUser = await UserModel.findByIdAndUpdate({_id:user?._id},{   firstName,
    lastName,
    region,
    phoneNumber,
    password,
    skillGapTag, profilePic:req.file},{new: true} )
        return res.json({
           status:"success",
           message:"Profile updated successfull",
           updateUser
        })

})


const findUserController = expressAsyncHandler(async(req,res) => {

      const {email, skillGapTag} = req.body
      if( !email  && !skillGapTag){
      throw new Error("Please enter a vlaid email or skillGapTag")
      }

const user  = await UserModel.findOne({email})
if(!user){
  throw new Error("User not found")
}
return res.status(201).json({
  status:"success",
  message:"user found successfully",
  data: user

})

})


const createTransferPinUserController = expressAsyncHandler(async(req, res) => {
const {transferPin} = req.body
if(!transferPin){
 throw new Error("missing credentials")
}

// find logged in user
const foundUser = await UserModel.findById(req.user)

if(!foundUser){
  throw new Error("User not found")
}


// save pin to db
foundUser.transferPin = transferPin

foundUser.save()

res.status(200).json({
  status: 'success',
  message: "Pin saved successfully",
  transferPin: foundUser.transferPin,
  foundUser
})


})

const logOutUserController = expressAsyncHandler(async (req, res) => {
 res.cookie("token", "", {
  maxAge:1
 })
res.status(200).json({
  statusbar: "success",
  message: "User logged out successfully"
})
})



const emailVerificationTokenUserController = expressAsyncHandler(async(req, res) => {
  // find the user in the db
  const user = await UserModel.findById(req.user)
 if(!user){
  throw new Error("User not found")
 }
 
 if(user.isEmailVerified){
     throw new Error("Email already verified")
 }
 // console.log("from email",user)
 const emailToken = await user.generateEmailVerificationToken()
 
 const savedUser = await user.save()
 
 
 sendAccountVerificationEmail("ukonulucky@gmail.com",emailToken)
 res.status(200).json({
   status: 'success',
   message:"Email sent successfully",
   emailToken,
   savedUser 
 })
 })
 
 
 const emailVerificationTokenConfirmationUserController =  expressAsyncHandler(async(req, res) => {
 const {emailToken} = req.params
 if(!emailToken){
    throw new Error("User token is required")
 }
 
 
 // find the user in the db
 const user = await UserModel.findById(req.user)
 if(!user){
  return res.status(401).json({
     message: "User not found"
   })
 }
 
 // convert the token to the format stored in the db
 const encryptedToken = crypto.createHash("sha256").update(emailToken).digest("hex");
 
 
 // check if encryptedToken is the same as that saved in db and also has not expired, then find the user
 const foundUser = await UserModel.findOne({
   accountVerificationToken: encryptedToken,
   accountVerificationTokenExpires:{ $gt: Date.now()}
 })
 if(!foundUser){
  return res.status(401).json({
     message:"email token expired or invalid",
     status:"failed",
     encryptedToken,
     user
   })
 }
 foundUser.isEmailVerified = true
 foundUser.accountVerificationToken = null
 foundUser.accountVerificationTokenExpires = null
 await foundUser.save()
 
 res.status(200).json({message:"email confirmation successful",foundUser})
 })
 
 const passwordResetGeneratorUserController = expressAsyncHandler(async(req, res) => {

  const user = await UserModel.findById(req.user)
  console.log(user)
  if(!user){
   throw new Error("User not found")
  }
 const randomNumber =  await user.generatePasswordUpdate()

const savedUser = await user.save()
  await sendPasswordChangeEmail("ukonulucky@gmail.com", randomNumber )
  res.status(200).json({
    message:"email sent successfully",
    randomNumber,
    savedUser

  })
 })
 

 const confirmUserPasswordToken= expressAsyncHandler(async(req, res)=> {
  
  const {passwordToken} = req.body
 if(!passwordToken){
    throw new Error("Passwprd token is required")
 }
 
 
 // find the user in the db
 const user = await UserModel.findById(req.user)
 if(!user){
  return res.status(401).json({
     message: "User not found"
   })
 }
 


 
 
 // check if the passwordToken is the same as that saved in db and also has not expired, then find the user
 console.log("this is the passwordToken", passwordToken)
 const foundUser = await UserModel.findOne({
  passwordRestToken: passwordToken,
  passwordResetTokenExpires:{ $gt: Date.now()}
 })
 if(!foundUser){
  return res.status(401).json({
     message:"password token expired or invalid",
     status:"failed",
     passwordToken,
     user
   })
 }

 foundUser.passwordRestToken = null
 foundUser.passwordResetTokenExpires = null
 foundUser.passwordChangeActivation = true
 await foundUser.save()
 
 res.status(200).json({message:"Password change mode activated",foundUser})



 })

 
const changePasswordUserController = expressAsyncHandler(async(req, res) =>{
    const user = await UserModel.findById(req.user);
    if(!user){
    throw new Error("User not found")
    }
    console.log("user before password change", user)
    const {password} = req.body
    if(!password){
        throw new Error("missing credentials")
      }
 if(!user.passwordChangeActivation){
   throw new Error("failed to validate password password activation token")     
 }

   // Hash the password with the generated salt
   const hashedPassword = await bcrypt.hash(password, 10)

 user.password = hashedPassword
user.passwordChangeActivation = false
await  user.save()

return res.status(200).json({
  statusbar: "success",
  message:"User password changed successfully",
  user
})

})

module.exports = {
  userRegisterController,
  userLoginController,
  depositUser,
  withdrawUser,
  userProfileUpdateController,
  findUserController,
  createTransferPinUserController,
  logOutUserController,
  emailVerificationTokenUserController,
  emailVerificationTokenConfirmationUserController,
  passwordResetGeneratorUserController,
  confirmUserPasswordToken,
  changePasswordUserController

};
