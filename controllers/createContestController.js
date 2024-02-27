const expressAsyncHandler = require("express-async-handler");
const CreateContestModel = require("../models/createContest");
const UserModel = require("../models/user");


// create contest

const createContestController = expressAsyncHandler(async(req, res) => {
 const {
    isOnline,
    opponentSkillGapTag,
    category,
    stake,
    hashTags,
    termsAndDescription
 } = req.body

// cheque if a user exist with the skillGapTags provide

if(!Array.isArray(opponentSkillGapTag)) throw new Error("Skill gap tags must be an array")

// check if all provided skill gaps are available in the user model
let skillGapError 

  for (let index = 0; index < opponentSkillGapTag.length; index++) {
        const skillGapUser = await UserModel.findOne({
          skillGapTag : opponentSkillGapTag[index]
        })
        console.log("this is the  skillGap user", skillGapUser)
        if(skillGapUser ==  null) { 
          skillGapError = `No user with skill gap tag ${opponentSkillGapTag[index]} found`
          break
        }
  }

  console.log("this is the skill gap error", skillGapError)
if(skillGapError) throw new Error(skillGapError)

if(!isOnline || !opponentSkillGapTag || !category || !stake || !hashTags || !termsAndDescription) throw new Error("Skill gap create contetest requirements not implemented")

    
  const constest = await CreateContestModel.create(req.body)
  
  res.status(200).json({
    status: true,
    message: "contest created successfully",
    id:constest._id
  })
})


const findSkillGapContestcrontrolelr = expressAsyncHandler(async(req, res) => {
    const {
        opponentSkillGapTag
     } = req.body
    
    // cheque if a user exist with the skillGapTags provide
    
    if(!Array.isArray(opponentSkillGapTag)) throw new Error("Skill gap tags must be an array")
    
    // check if all provided skill gaps are available in the user model
    
    opponentSkillGapTag.map(async(skillGap) => {
      const skillGapUser = await UserModel.findOne({
        skillGapTag : skillGap
      })
      if(!skillGapUser) throw new Error(`No user with skill gap tag ${{skillGap}} found`)
    })
    

    res.status(200).json({
        status: true, 
        message:"Skill gap tag exist"
    })
    
})

module.exports = {
 createContestController,
 findSkillGapContestcrontrolelr
};
