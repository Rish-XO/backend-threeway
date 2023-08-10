const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
    const jwtToken = req.header("token");
    if (!jwtToken) {
      return res.status(403).json("Not authorized");
    }
    try {
        const payload = await jwt.verify(jwtToken, process.env.secret);
        req.user = payload.user;
        next();
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server error");
    }
  };
  