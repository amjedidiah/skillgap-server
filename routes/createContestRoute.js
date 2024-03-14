const express = require('express');
const { createContestController, findSkillGapContestcrontrolelr } = require('../controllers/createContestController');
const isAuthenticated = require('../Middleware/isAuthenticated');


const createContestRouter = express.Router();


createContestRouter.post("/create-contest",isAuthenticated, createContestController)

createContestRouter.get("/find-skillGap", findSkillGapContestcrontrolelr )







module.exports = createContestRouter