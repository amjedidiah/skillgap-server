const express = require('express');
const multer = require('multer');

const {userRegisterController, userLoginController, userProfileUpdateController,findUserController, createTransferPinUserController, logOutUserController, emailVerificationTokenUserController, emailVerificationTokenConfirmationUserController, passwordResetGeneratorUserController, changePasswordUserController, confirmUserPasswordToken } = require("../controllers/userController");
const fileUploadSetting = require('../utils/fileUpload');
const isAuthenticated = require('../Middleware/isAuthenticated');

const userRouter = express.Router();



const upload = multer({storage: fileUploadSetting})


userRouter.post("/register", userRegisterController)
userRouter.put("/profileUpdate",isAuthenticated,upload.single("image"), userProfileUpdateController)
userRouter.post("/login", userLoginController)
userRouter.get("/",isAuthenticated,findUserController)
userRouter.post("/createPin",isAuthenticated, createTransferPinUserController)
userRouter.get("/logOut",isAuthenticated, logOutUserController)

userRouter.get("/account-verification-email", isAuthenticated,  emailVerificationTokenUserController)
userRouter.get("/account-verification-email/:emailToken", isAuthenticated, emailVerificationTokenConfirmationUserController)

// password reset
userRouter.get("/password-reset-token-generator", isAuthenticated, passwordResetGeneratorUserController)
userRouter.get("/password-reset-token-confirmation", isAuthenticated, confirmUserPasswordToken)
userRouter.get("/password-reset-update", isAuthenticated, changePasswordUserController)

module.exports = userRouter

