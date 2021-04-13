const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "Token not exists" });
  }

  try {
    const decoded = jwt.verify(token, config.get("secret"));
    req.user = decoded.user;

    req.user.type = req.user.user_type;

    next();
  } catch (err) {
    res.status(401).json({ msg: "token invalid" });
  }
};
