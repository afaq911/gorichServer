const jwt = require("jsonwebtoken");

const VerifyToken = (req, res, next) => {
  const AuthHeader = req.headers.token;
  if (AuthHeader) {
    const token = AuthHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_PRIVATE, (err, user) => {
      if (err) {
        res.status(401).json("Session expired please login again!");
        return;
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    res.status(401).json("You are not Authorized");
  }
};

const VerifyTokenAndAdmin = (req, res, next) => {
  VerifyToken(req, res, () => {
    if (req.user.isAdmin === true) {
      next();
    } else {
      res.status(401).json("You are not Authorized");
    }
  });
};

const VerifyTokenAndAuth = (req, res, next) => {
  VerifyToken(req, res, () => {
    if (req.user._id === req.body.userId || req.user._id === req.params.id) {
      next();
    } else {
      res.status(401).json("You are not Authorized");
    }
  });
};

module.exports = { VerifyToken, VerifyTokenAndAuth, VerifyTokenAndAdmin };
