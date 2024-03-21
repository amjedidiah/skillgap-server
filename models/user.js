const mongoose = require('mongoose');
const crypto = require("crypto");
const generateRandomIntegers = require('../utils/generateRandomIntegers');



const userSchema = mongoose.Schema({
    firstName: {
        type: String,
         required: true,

        },
    userName: {
            type: String,
             required: true,
             unique: true,
             lowercase: true
            
            },
   skillGapTag: {
              type: String,
               required: true,
               unique: true,
               lowercase: true
              },
    lastName: {
            type: String,
            required: true,
            },
    email: {
        type: String,
         required: true,
          unique: true,
          lowercase: true
        },
    region: {
            type: String,
             required: true,
            },
    phoneNumber: {
                type: String,
                 required: true,
                 unique: true
                },
    transferPin: {
        type: Number, 
        required: false
    },
    
    profilePic: {
        type: Object,
        required: true,
        default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    accountVerificationToken: { type: String, default: null },
    accountVerificationTokenExpires: { type: Date, default: null },
   
    
    twitter: {
        type: String,
        default: null,
        },
     tiktok: {
            type: String, 
            default: null,
            },
    facebook: {
                type: String,
                default: null,
                },
    youtube:{
        type: String,
         default: null,
         
    },
    expoPushNotificationToken:{
    type: Boolean,
    default: false
    },
    totalEarnings: { type: Number, default: 0 },
    isLoggedIn: { type: Boolean, default: false},
    balance: { type: Number, 
        default:0
        }
    
    
}, {timestamps: true})


userSchema.methods.generateEmailVerificationToken = function () {
  // creating a token for the  accountVerificationToken
  emailToken = crypto.randomBytes(20).toString("hex");
  this.accountVerificationToken = crypto.createHash("sha256").update(emailToken).digest("hex");

  // create a date for the token to expire
  this.accountVerificationTokenExpires = Date.now() + 20 * 60 * 1000 // expires in 20 minutes

  return emailToken
}



const UserModel = mongoose.model("userReg", userSchema)

module.exports = UserModel