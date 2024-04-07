const passport = require("passport");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const { Magic } = require("@magic-sdk/admin");
const crypto = require("crypto");
const sendAccountVerificationEmail = require("../utils/sendAccountVerificationEmail");
const { createToken, validateJwt } = require("../utils/jwt");
const sendSuccessEmail = require("../utils/sendSuccessEmail");
const sendExpoPushNotification = require("../utils/sendExpoPushNotification");

const magicTokenValidationUserController = expressAsyncHandler(
  async (req, res) => {
    const { magicToken } = req.body;

    // authenticate magicToken
    if (!magicToken) throw new Error("Magic token is required");

    // connecting to magic server
    const magic = await Magic.init(process.env.Magic_Api_Key);

    // the magic.token.validate =>  returns void if token is authentic and not expired. If the token is forged or otherwise invalid, the function will throw a descriptive error
    magic.token.validate(magicToken);

    // get magic token email
    const { issuer } = await magic.users.getMetadataByToken(magicToken);

    const jwt = createToken(issuer);

    return res.status(200).json({ jwt: jwt });
  }
);

const userRegisterController = expressAsyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, region, userName, jwt } =
      req.body;
    if (
      !firstName ||
      !email ||
      !phoneNumber ||
      !region ||
      !userName ||
      !lastName
    ) {
      throw new Error("Missing credentials");
    }

    // verify the jwt
    const isJwtValid = validateJwt(jwt);

    if (!jwt || !isJwtValid) throw new Error("Email validation failed ");
    const emailToLowercase = email.toLowerCase();
    req.body.email = emailToLowercase;

    const doesUserExist = await UserModel.findOne({
      email: emailToLowercase,
    });

    if (doesUserExist) {
      throw new Error("Email already exist");
    }
    const doesUserNameExist = await UserModel.findOne({
      userName,
    });
    if (doesUserNameExist) {
      throw new Error("User name already taken ");
    }

    // save user to db

    const createdUser = await UserModel.create({
      ...req.body,
      skillGapTag: userName,
      balance: 2000,
    });

    createdUser.isLoggedIn = true;
    createdUser.save();
    const { _id, isLoggedIn, email: userEmail, balance } = createdUser;
    // send success email
    await sendSuccessEmail(email, "Email Verification Success", firstName);

    res.status(201).json({
      status: true,
      message: "user logged in successfully",
      id: _id,
      firstName,
      lastName,
      userEmail,
      jwt,
      isLoggedIn,
      balance,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// user login
const userLoginController = expressAsyncHandler(async (req, res, next) => {
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
      isEmailVerified: user?.isEmailVerified,
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

const userProfileUpdateController = expressAsyncHandler(async (req, res) => {
  const { firstName, lastName, skillGapTag, region, phoneNumber, password } =
    req.body;

  if (!firstName && !lastName && !skillGapTag && !req.file) {
    throw new Error("User profile update failed");
  }
  // find user
  const user = await UserModel.findOne({ skillGapTag }); //
  if (!user) {
    throw new Error("User not found");
  }

  const updateUser = await UserModel.findByIdAndUpdate(
    { _id: user?._id },
    {
      firstName,
      lastName,
      region,
      phoneNumber,
      password,
      skillGapTag,
      profilePic: req.file,
    },
    { new: true }
  );
  return res.json({
    status: "success",
    message: "Profile updated successfull",
    updateUser,
  });
});

const findUserController = expressAsyncHandler(async (req, res) => {
  const { email, skillGapTag } = req.body;
  if (!email && !skillGapTag) {
    throw new Error("Please enter a vlaid email or skillGapTag");
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  return res.status(201).json({
    status: "success",
    message: "user found successfully",
    data: user,
  });
});

const createTransferPinUserController = expressAsyncHandler(
  async (req, res) => {
    const { transferPin } = req.body;
    if (!transferPin) {
      throw new Error("missing credentials");
    }

    // find logged in user
    const foundUser = await UserModel.findById(req.user);

    if (!foundUser) {
      throw new Error("User not found");
    }

    // save pin to db
    foundUser.transferPin = transferPin;

    foundUser.save();

    res.status(200).json({
      status: "success",
      message: "Pin saved successfully",
      transferPin: foundUser.transferPin,
      foundUser,
    });
  }
);

const logOutUserController = expressAsyncHandler(async (req, res) => {
  const foundUser = req.user;

  foundUser.isLoggedIn = false;
  await foundUser.save();
  console.log("ran at logout");
  res.status(200).json({
    statusbar: "success",
    message: "User logged out successfully",
  });
});

const emailVerificationTokenUserController = expressAsyncHandler(
  async (req, res) => {
    // find the user in the db
    const user = await UserModel.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isEmailVerified) {
      throw new Error("Email already verified");
    }

    const emailToken = await user.generateEmailVerificationToken();

    const savedUser = await user.save();

    sendAccountVerificationEmail("ukonulucky@gmail.com", emailToken);
    res.status(200).json({
      status: "success",
      message: "Email sent successfully",
      emailToken,
      savedUser,
    });
  }
);

const emailVerificationTokenConfirmationUserController = expressAsyncHandler(
  async (req, res) => {
    const { emailToken } = req.params;

    if (!emailToken) {
      throw new Error("User email verification token is required");
    }
    // check if emailToken is valid and has not expired

    //  encrypt the email to the encrypted version
    const encryptedToken = crypto
      .createHash("sha256")
      .update(emailToken)
      .digest("hex");
    const foundUser = await UserModel.findOne({
      accountVerificationToken: encryptedToken,
      accountVerificationTokenExpires: { $gt: Date.now() },
    });
    if (!foundUser)
      throw new Error("Invalid account verification token or token expired");

    foundUser.isEmailVerified = true;
    foundUser.accountVerificationToken = null;
    foundUser.accountVerificationTokenExpires = null;
    await foundUser.save();

    // \\views\\layouts\\main.handlebars'"

    const { email, firstName } = foundUser;
    await sendSuccessEmail(email, "Email Verification Success", firstName);

    //  res.status(200).json({message:"sucess"})
    res.render("webMessageForSuccessEmailVerification", { firstName });
  }
);

const sendEmailVerificationUserController = expressAsyncHandler(
  async (req, res) => {
    const { email } = req.body;
    if (!email) throw new Error("Please enter a valid email");

    const emailToLowercase = email.toLowerCase();
    req.body.email = emailToLowercase;

    const user = await UserModel.findOne({
      email: emailToLowercase,
    });

    if (!user) {
      throw new Error("Email does not exist please register");
    }

    // generated an encrypted email token
    const emailToken = await user.generateEmailVerificationToken();
    await user.save();

    // emailTo, emailSubject, firstName, id
    await sendAccountVerificationEmail(
      user.email,
      "Account Verification",
      user?.firstName,
      emailToken
    );

    res.status(201).json({
      status: "success",
      message: "Veification email sent successfully",
      data: user._id,
    });
  }
);

const loginUserWithMagic = expressAsyncHandler(async (req, res) => {
  try {
    const { magicToken } = req.body;
    // connecting to magic server
    const magic = await Magic.init(process.env.Magic_Api_Key);

    // authenticate magicToken
    if (!magicToken) throw new Error("login token is required");
    // the magic.token.validate =>  returns void if token is authentic and not expired. If the token is forged or otherwise invalid, the function will throw a descriptive error
    magic.token.validate(magicToken);

    // get magic token email
    const { email } = await magic.users.getMetadataByToken(magicToken);

    // get the user with email from the db
    const foundUser = await UserModel.findOne({ email });
    if (!foundUser) {
      throw new Error("User not found");
    }

    foundUser.isLoggedIn = true;

    await foundUser.save();
    const {
      _id,
      firstName,
      lastName,
      email: userEmail,
      isLoggedIn,
      balance,
      userName,
      profilePic,
    } = foundUser;
    console.log("login data", profilePic, _id);

    // create jwt token and cookie
    const jwt = createToken(_id);

    // res.cookie("user-login",jwt, {
    //   maxAge: 60 * 60 * 24 * 1000, // 24 hours
    //   secure: false, // Set to true if using HTTPS
    //   httpOnly: true, // Enhances security by preventing client-side access
    //   sameSite: true // Mitigates CSRF attacks
    // })

    res.status(200).json({
      status: true,
      message: "user logged in successfully now",
      id: _id,
      firstName,
      lastName,
      userEmail,
      jwt,
      isLoggedIn,
      balance,
      userName,
      profilePic,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const doesEmailExistUserController = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new Error("Email is required");

  // convert email to lowercase
  const newEmail = email.toLowerCase();

  const foundUser = await UserModel.findOne({ email: newEmail });
  if (!foundUser) throw new Error("User not found");
  res.status(200).json({
    status: true,
    doesEmailExist: true,
  });
});

const CheckEmailOrPhoneNumberOrUserNameExistUserController =
  expressAsyncHandler(async (req, res) => {
    const { email, phoneNumber, userName } = req.body;

    if (!email) throw new Error("Email is required");
    if (!userName) throw new Error("User name is required");
    if (!phoneNumber) throw new Error("Phone number is required");

    // convert email to lowercase
    const newEmail = email.toLowerCase();
    const newUserName = userName.toLowerCase();
    const doesEmailExist = await UserModel.findOne({ email: newEmail });
    if (doesEmailExist) throw new Error("Email allready exist");
    const doesPhoneNumberExist = await UserModel.findOne({ phoneNumber });
    if (doesPhoneNumberExist) throw new Error("Phone number allready exist");
    const doesUserNameExist = await UserModel.findOne({
      userName: newUserName,
    });
    if (doesUserNameExist) throw new Error("User name allready exist");

    res.status(200).json({
      status: true,
      doesEmailOrPhoneNumberOrUserNameExist: false,
    });
  });

const findAllUser = expressAsyncHandler(async (req, res) => {
  const users = await UserModel.find();
  res.status(200).json({
    users,
  });
});

const testPushNotification = expressAsyncHandler(async (req, res) => {
  const { expoNotification } = req.body;
  await sendExpoPushNotification(expoNotification);
  res.status(200).json({
    message: "notification sent",
    status: true,
  });
});
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
  loginUserWithMagic,
  sendEmailVerificationUserController,
  magicTokenValidationUserController,
  doesEmailExistUserController,
  CheckEmailOrPhoneNumberOrUserNameExistUserController,
  findAllUser,
  testPushNotification,
};
