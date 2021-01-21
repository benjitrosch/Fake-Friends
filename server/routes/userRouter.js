const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');
const cookieController = require('../controller/cookieController');
const sessionController = require('../controller/sessionController');

// route post event for when a user signs up/registers --->
router.post('/register', userController.postLogin, (req, res) => {
    res.status(200).json(res.locals.userId);
})

// routes get request to verify that the current user is looged in --> 
router.get('/verify', sessionController.isLoggedIn, (req, res) => {
  res.status(200).json(res.locals.verify);
})

// routes get request to retrieves the corresponding username based on user id --->
router.get('/:id', userController.getUser, (req, res) => {
  res.status(200).json(res.locals.username);
})

router.get('/survey/:id', userController.getUserSurveys, (req, res) => {
  res.status(200).json(res.locals.surveys);
})

// routes a post request to log a user in  --->
router.post('/login', 
  userController.verifyUser,
  sessionController.startSession,  
  cookieController.setSSIDCookie, 
  (req, res) => {
  res.status(200).json(res.locals.userId);
});

module.exports = router;