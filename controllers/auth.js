const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorization");

//registering
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password , address, userType} = req.body;

    // check if the user already exist
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length !== 0) {
      return res.status(401).send("User already exist");
    }

    // bcrypt password
    const salt = await bcrypt.genSalt(10);
    const hashpwd = await bcrypt.hash(password, salt);

    //enter the new user to database
    const newUser = await pool.query(
      "INSERT INTO users (firstname, lastname, email, password , role, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [firstName, lastName, email, hashpwd, userType, address]
    );

    // jwt token generator
    const token = await jwtGenerator(newUser.rows[0].user_id);

    // console.log(token, newUser.rows[0]);
    res.json({ token, role: newUser.rows[0].role, id: newUser.rows[0].user_id });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email, 
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("email or password incorrect");
    }
   

    const validatePassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validatePassword) {
      return res.status(401).json("email or password incorrect");
    }
    const id = user.rows[0].user_id;
    // console.log(id);
    const token = await jwtGenerator(user.rows[0].user_id);
    res.json({ id,token, role: user.rows[0].role });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
});

// verify
router.post("/is-verify", authorization, async (req, res) => {
    const {user_id} = req.body
  try {
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
        user_id, 
      ]);
    //   console.log(user_id,user.rows[0]);
    res.json({ status: true, role: user.rows[0].role, id: req.user });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
