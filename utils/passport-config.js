const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const  JWTStrategy = require('passport-jwt').Strategy; // Strategy for jwt
const  ExtractJwt = require('passport-jwt').ExtractJwt; // Extract for jwt



const UserModel = require('../models/user');


//Configuring JWT Options
const options={
    jwtFromRequest:ExtractJwt.fromExtractors([(req) => {
        let token = null
        if(req && req.cookies){
             token = req.cookies["token"]
             return token
        }

    }]),
    secretOrKey: process.env.JWT_SECRET
}

//JWT
passport.use(
    new JWTStrategy(options, async(userDecoded, done) => {
          try{
            const user = await UserModel.findById(userDecoded.id);
            if(user){
                done(null, user)
            }else{
                console.log("ran here")
                done(null, false, {message: "User not logged in"})
            }

          }catch(error){
            console.log("ran here 22")
                  done(error)
          }
    })
)


// !passport configuration

 passport.use(
    new LocalStrategy({
        usernameField: "email" // one can specify either username or emmail depending on the login method.
    }, async (email, password, done) => {
        try{
         
            const user = await UserModel.findOne({
                email
            })
            if(!user){
                return done(null, false, {message: "Invalid login credentials"})
            }
          // compareing user password using
          const isPasswordMatch = await bcrypt.compare(password, user.password)
          
          if(!isPasswordMatch) {
            return done(null, false, {message:"Invalid login credentials"})
          }
          return done(null, user)
        }catch(err){
             return done(err)
        }
    })
)


const passportConfig = passport
module.exports = passportConfig
