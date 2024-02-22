const passport = require('passport')


const isAuthenticated = (req, res, next) => {
 
passport.authenticate("jwt", {session: false}, (err, user, info) => {

if(err || !user){
 return res.status(401).json({
    error : err? err?.message : undefined,
    message: info ? info.message : "user not logged in"
 })
}
   req.user = user._id
next()
})(req, res, next);

}


module.exports = isAuthenticated