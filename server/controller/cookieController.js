// creates a cookie --->
exports.setSSIDCookie = (req, res, next) => { 
  const { userId } = res.locals;
  res.cookie('ssid', userId, {httpOnly: true});
  return next()
};

