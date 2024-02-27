const mongoose = require('mongoose');
const crypto = require("crypto");
const generateRandomIntegers = require('../utils/generateRandomIntegers');



const createContestSchema = mongoose.Schema({
    isOnline: {
        type: Boolean,
         required: true,
          default: true
        },
     opponentSkillGapTag: {
            type: [String],
             required: false,
            },
   category: {
             type:Object,
            required: true,
              },
    stake: {
            type: Number,
            required: true,
            },
    termsAndDescription: {
        type: String,
         required: true
        },
    hashTags: {
            type:[String]
        }
}, {timestamps: true})





const CreateContestModel = mongoose.model("createContest", createContestSchema)

module.exports = CreateContestModel