const Session = require('../models/sessionModel');

/**
* isLoggedIn - find the appropriate session for this request in the database, then
* verify whether or not the session is still valid.
*/
exports.isLoggedIn = (req, res, next) => {
  const { ssid } = req.cookies;

  Session.findOne({cookieId: ssid})
   .then(data => {
    // check if null is returned -> if so, redirect to login
    // otherwise, next;
    return data ? (res.locals.verify = data.cookieId, next()) : (res.locals.verify = false, next());
  })
  .catch(err => {
    res.locals.verify = false;
    return next();
  });
};

/**
* startSession - create and save a new Session into the database.
*/
exports.startSession = (req, res, next) => {
  const { userId } = res.locals;

  Session.create({ cookieId: userId.toString() })
  .then(data => {
    return next();
  })
  .catch(err => {
    console.log(err)
    return next();
  })
};

