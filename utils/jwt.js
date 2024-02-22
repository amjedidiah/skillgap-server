const jwt = require("jsonwebtoken")


const tokenTime = 60 * 60 * 60 * 24

const createToken = function(id){
    return jwt.sign(id, process.env.JWT_SECRET,{
        expiresIn: tokenTime
    })
}

const validateAuth = (req, res, next) => {
    
    const token = req.cookies["user-login"]
    if ( !token ) {
        res.status(400).json("user not logged in")
        return
    }
    
        const data = jwt.verify(token, process.env.JWT_SECRET)
    if(!data){
        return res.status(403).json("user not logged in")
    }
    next()

    
}

module.exports = {validateAuth, createToken, tokenTime}