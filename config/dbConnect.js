const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
require("dotenv").config()



const dbConnection = async function () {
    try {
        const res = await mongoose.connect(process.env.MONGU_URL, {
            // useUnifiedTopology: true,
            // useNewUrlParser: true,
            autoIndex: true
        })

        if (res) {
            return res
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = dbConnection