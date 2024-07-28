const jwt = require("jsonwebtoken");
const secret = process.env.secret;

function generateToken(userId, isAdmin) {
  return jwt.sign(
    {
      userId: userId,
      isAdmin: isAdmin,
    },
    secret,
    { expiresIn: "1m" }
  );
}

module.exports = generateToken;
