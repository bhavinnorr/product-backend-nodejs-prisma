const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(401);
      }
      req.user = user;
      const url = req.url;
      console.log("URL:- "+url);
      if ("/profile"==url){
        return res.send(user);
      }
      next();
    });
  } else {
    return res.sendStatus(401);
  }
};
module.exports = authMiddleware;