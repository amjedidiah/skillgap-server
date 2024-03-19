const express = require('express');
const multer = require('multer');

const {userRegisterController, userProfileUpdateController,findUserController, createTransferPinUserController, logOutUserController, emailVerificationTokenUserController, emailVerificationTokenConfirmationUserController, loginUserWithMagic, sendEmailVerificationUserController, magicTokenValidationUserController, doesEmailExistUserController, CheckEmailOrPhoneNumberOrUserNameExistUserController, findAllUser } = require("../controllers/userController");
const fileUploadSetting = require('../utils/fileUpload');
const isAuthenticated = require('../Middleware/isAuthenticated');

const userRouter = express.Router();



const upload = multer({storage: fileUploadSetting})


userRouter.post("/register", userRegisterController)
userRouter.put("/profileUpdate",isAuthenticated,upload.single("image"), userProfileUpdateController)
userRouter.post("/login", loginUserWithMagic)
userRouter.get("/",isAuthenticated,findUserController)
userRouter.post("/createPin",isAuthenticated, createTransferPinUserController)
userRouter.post("/logOut",isAuthenticated, logOutUserController)
userRouter.get("/account-verification-email", isAuthenticated,  emailVerificationTokenUserController)
userRouter.get("/account-verification-email/:emailToken", emailVerificationTokenConfirmationUserController)
userRouter.post("/createdUser-account-verification", sendEmailVerificationUserController)
userRouter.post("/validate-magicToken", magicTokenValidationUserController)
userRouter.post("/validate-email", doesEmailExistUserController)

userRouter.post("/does-email-phoneNumber-userName-exist", CheckEmailOrPhoneNumberOrUserNameExistUserController)
userRouter.get("/all-users", findAllUser)

module.exports = userRouter
