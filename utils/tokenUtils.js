const jwt = require("jsonwebtoken");

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

module.exports = { createAccessToken, createRefreshToken };
