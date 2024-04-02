const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function userJwt(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token is required" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.secret);
    req.user = decoded;
    const user = await User.findById(req.user.userId);
    
    if(!user){
      return res.status(401).json({ error: "user doesn't exist" });
    }
    if(!user.isValidated){
      return res.status(401).json({ error: "Not validated" });
    }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = userJwt;
