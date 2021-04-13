module.exports = function (req, res, next) {
  if (req.user.type != "admin") {
    return res.status(401).json({ msg: "Acccess Denied" });
  }

  try {
    next();
  } catch (err) {
    res.status(401).json({ msg: "Error Occured" });
  }
};
