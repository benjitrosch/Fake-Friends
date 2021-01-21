const express = require('express');
const router = express.Router();

const surveyController = require('../controller/surveyController');
const sessionController = require('../controller/sessionController');
const userController = require('../controller/userController');

// adds a new survey to db --->
router.post('/addsurvey', sessionController.isLoggedIn, surveyController.createNewSurvey, userController.updateSurveys, (req, res) => {
    res.status(200).json(res.locals.roomId);
});

// routes a get request for a specified surveyId --->
router.get('/:id',
    surveyController.getSurveyID, (req, res) => {
    res.status(200).json(res.locals.verifySurvey);
});

module.exports = router;