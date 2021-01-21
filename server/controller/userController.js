const User = require('../models/userModel');

// create a new User in db during sign-up/register --->
exports.postLogin = (req, res, next) => {
  const newUser = req.body;

  User.create(newUser)
  .then(data => {
    res.locals.userId = data._id;
    next();
  })
  .catch(err => {
    const errorObj = {
      message: `Error in user.postLogin: error creating user in DB: ${err}`,
      log: 'Error in userController.postLogin. Check error error logs'  
    }
    next(errorObj);
  });
};

// verify user's login credentials --->
exports.verifyUser =(req, res, next)=>{
  const userLogin = req.body;
  User.findOne(userLogin)
  .then(data => {
    if (data === null) return res.redirect('/user/register');
    res.locals.userId = data._id;
    next();
  })
  .catch(err => {
    const errorObj = {
      message: `Error in user.verifyUser: error creating user in DB: ${err}`,
      log: 'Error in userController.verifyUser. Check error error logs'
    };
    next(errorObj);
  });
};

// retrieves username for a specific user given the userId --->
exports.getUser = (req, res, next) => {
  User.findOne({_id: req.params.id})
    .then(data => {
      res.locals.username = data.username;
      return next();
    })
    .catch(err => {
      const errorObj = {
        message: `Error in user.getUser: error getting user from DB: ${err}`,
        log: 'Error in userController.getUser. Check error error logs'
      };
      return next(errorObj);
    })
}

exports.updateSurveys = (req, res, next) => {

  const user_id = req.body.user_id;
  const surveyID = res.locals.roomId;

  User.findOneAndUpdate({_id: user_id}, {$push: {survey_ids: surveyID}})
    .then(()=>{
      return next();
    })
}

exports.getUserSurveys = (req, res, next) => {
  User.findOne({_id: req.params.id})
    .then(data => {
      res.locals.surveys = data.survey_ids;
      return next();
    })
    .catch(err => {
      const errorObj = {
        message: `Error in user.getUserSurveys: error getting user surveys from DB: ${err}`,
        log: 'Error in userController.getUserSurveys. Check error error logs'
      };
      return next(errorObj);
    })
}