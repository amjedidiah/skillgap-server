const express = require('express');
const { createContestController, findSkillGapContestcrontrolelr } = require('../controllers/createContestController');


const createContestRouter = express.Router();


createContestRouter.post("/create-contest", createContestController)

createContestRouter.get("/find-skillGap", findSkillGapContestcrontrolelr )







module.exports = createContestRouter