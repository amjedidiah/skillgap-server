const expressAsyncHandler = require("express-async-handler");
const CreateContestModel = require("../models/createContest");
const UserModel = require("../models/user");

// create contest

const createContestController = expressAsyncHandler(async (req, res) => {
  const {
    isOnline,
    opponentSkillGapTag,
    category,
    stake,
    hashTags,
    termsAndDescription,
  } = req.body;

  // check if user has sufficient balance to stake from
  const {balance, email} = req.user

  if(balance < stake){
  throw new Error("Insufficient balance to stake")
  }


// set the contest to be public by default

  let isPrivate = false
  const { skillGapTag: userSkillGapTag, _id:hostId } = req.user;

  console.log(req.body)

  let skillGapError;
  // cheque if a user exist with the skillGapTags provide

  console.log(opponentSkillGapTag);
  let opponentIdArray = [];
if(opponentSkillGapTag.length > 0){
  isPrivate = true
  // check if the array of skillgapTag contains the users skillGapTag
  
  for (let index = 0; index < opponentSkillGapTag.length; index++) {
    if (userSkillGapTag === opponentSkillGapTag[index].toLowerCase()) {
      skillGapError = "User can not contest with itself";
      break;
    }
  }
  if (skillGapError) throw new Error(skillGapError);
  // check if all provided skill gaps tags are available in the user model
  
 
  for (let index = 0; index < opponentSkillGapTag.length; index++) {
    const skillGapUser = await UserModel.findOne({
      skillGapTag: opponentSkillGapTag[index],
    });

    if (!skillGapUser) {
      skillGapError = `No user with skill gap tag ${opponentSkillGapTag[index]} found`;
      opponentIdArray = [];
      break;
    }
 
    opponentIdArray.push(skillGapUser._id);
  }


}



  if (skillGapError) throw new Error(skillGapError);

  if (
    !isOnline ||  
    !category ||
    !stake ||
    !hashTags ||
    !termsAndDescription
  )
    throw new Error("Skill gap create contetest requirements not implemented");


  //  const updatedUserBalance = await UserModel.findOneAndUpdate({
  //   email,
  //   balance: balance - stake
  //  }) 

  // Start a new transaction
  // const session = await mongoose.startSession();

  // mongoose.startTransaction()

  const contestCreated = await CreateContestModel.create({
    isPrivate,
    isOnline,
    category,
    stake,
    hashTags,
    termsAndDescription,
    opponentIdArray,
    hostId
  });

// update the balance after createing contest

const updateBalance = await UserModel.findOneAndUpdate({
  email
},
{
  balance: balance - stake
}, {
  new: true
})

const {balance : newBalance} = updateBalance


     // Commit the transaction
//  await session.commitTransaction();

console.log("this is the new Balance", newBalance)
  res.status(200).json({
    status: true,
    message: "contest created successfully",
   isOnline,
   opponentSkillGapTag: opponentSkillGapTag.length > 0 ? opponentSkillGapTag[0] : null,
   stake,
   category: category.categoryMain,
   isPrivate,
   userSkillGapTag,
   contestStatus: contestCreated?.contestStatus,
   id: contestCreated?._id ,
   balance: newBalance
  
  });
});

const findSkillGapContestcrontrolelr = expressAsyncHandler(async (req, res) => {
  const { opponentSkillGapTag } = req.body;

  // cheque if a user exist with the skillGapTags provide

  if (!Array.isArray(opponentSkillGapTag))
    throw new Error("Skill gap tags must be an array");

  // check if all provided skill gaps are available in the user model

  opponentSkillGapTag.map(async (skillGap) => {
    const skillGapUser = await UserModel.findOne({
      skillGapTag: skillGap,
    });
    if (!skillGapUser)
      throw new Error(`No user with skill gap tag ${{ skillGap }} found`);
  });

  res.status(200).json({
    status: true,
    message: "Skill gap tag exist",
  });
});

const getAllContestForUserController = expressAsyncHandler(async(req, res) => {

     const {_id, userName} = req.user
     console.log(_id)

     const allContest = await CreateContestModel.find({
     hostId:_id
     }).populate("opponentIdArray")

     if(allContest.length == 0){
      return res.status(200).json({
        status:false,
        message: "contest fetched successfully",
        allContest:[]
      });
       

     }
  
const formatedContestArray = []



// {
//   "contestStatus": "pending",
//   "_id": "65f86ccbd5dd851d01128b6f",
//   "isOnline": true,
//   "isPrivate": false,
//   "opponentIdArray": [
//       {
//           "_id": "65f5c0d78e896ccddaed1688",
//           "firstName": "Sam ",
//           "userName": "sam",
//           "skillGapTag": "sam",
//           "lastName": "John",
//           "email": "ukoniifeanyichukwu@gmail.com",
//           "region": "{\"cca2\":\"AO\",\"currency\":[\"AOA\"],\"callingCode\":[\"244\"],\"region\":\"Africa\",\"subregion\":\"Middle Africa\",\"flag\":\"flag-ao\",\"name\":\"Angola\"}",
//           "phoneNumber": "+2347063033156",
//           "profilePic": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
//           "isBlocked": false,
//           "accountVerificationToken": null,
//           "accountVerificationTokenExpires": null,
//           "twitter": null,
//           "tiktok": null,
//           "facebook": null,
//           "youtube": null,
//           "isEmailVerified": false,
//           "expoPushNotificationToken": false,
//           "totalEarnings": 0,
//           "isLoggedIn": false,
//           "createdAt": "2024-03-16T15:55:03.563Z",
//           "updatedAt": "2024-03-16T15:58:16.208Z",
//           "__v": 0
//       }
//   ],
//   "category": {
//       "categoryMain": "Casual Activities",
//       "categoryHeading": "Long Tennis",
//       "categorySub": "Ball joggling"
//   },
//   "stake": 200,
//   "termsAndDescription": "For the gane",
//   "hashTags": [
//       "#Car",
//       "#Car",
//       "#Car",
//       "#Car"
//   ],
//   "hostId": "65f5bf238e896ccddaed166c",
//   "createdAt": "2024-03-18T16:33:15.520Z",
//   "updatedAt": "2024-03-18T16:33:15.520Z",
//   "__v": 0
// }

allContest.forEach(element => {
  const item = {}
  item.isOnline = element.isOnline
  item.stake = element.stake
  item.category = element.category.categoryMain,
  item.opponentSkillGapTag = element.opponentIdArray[0].skillGapTag,
  item.contestStatus = element.contestStatus
  item.userSkillGapTag = userName
  formatedContestArray.push(item)

});

  console.log(formatedContestArray)
     res.status(200).json({
      status: true,
      message: "contest fetched successfully",
     allContest:formatedContestArray
    });
     
})

module.exports = {
  createContestController,
  findSkillGapContestcrontrolelr,
  getAllContestForUserController 
};
