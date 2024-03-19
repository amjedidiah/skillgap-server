const mongoose = require('mongoose');

const createContestSchema = mongoose.Schema({

    isOnline: {
        type: Boolean,
         required: true,
          default: true
        },
        contestStatus: {
        type: String,
         required: true,
          default: "pending"
        },
    isPrivate: {
        type: Boolean,
         required: true,
        },
        opponentIdArray: {
            type: [
             {
                type: mongoose.Schema.Types.ObjectId,
                ref:"userReg",
             }
            ],
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
        },
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
}, {timestamps: true})





const CreateContestModel = mongoose.model("createContest", createContestSchema)

module.exports = CreateContestModel