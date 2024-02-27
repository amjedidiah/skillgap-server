const jwt = require("jsonwebtoken")


const tokenTime = 60 * 60 * 60 * 24

const createToken = function(id){
   
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: tokenTime
    })
}

const validateJwt = (jwtToken) => {
        const data = jwt.verify(jwtToken, process.env.JWT_SECRET)
    if(!data){
         throw new Error("Usr registration failed")
    }
return data
    
}

module.exports = {validateJwt, createToken, tokenTime}