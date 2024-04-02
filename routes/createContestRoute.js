const express = require('express');
const { createContestController, findSkillGapContestcrontrolelr, getAllContestForUserController } = require('../controllers/createContestController');
const isAuthenticated = require('../Middleware/isAuthenticated');


const createContestRouter = express.Router();


createContestRouter.post("/create-contest",isAuthenticated, createContestController)

createContestRouter.get("/find-skillGap", findSkillGapContestcrontrolelr )
createContestRouter.post("/get-all-user-contest",isAuthenticated, getAllContestForUserController)









module.exports = createContestRouter