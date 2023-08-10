const jwt = require('jsonwebtoken')
require('dotenv').config()

function jwtGenerator(user_id) {
    const payload = {
        user: user_id
    }

    return jwt.sign(payload, process.env.secret, {expiresIn: "2d"})
}

module.exports = jwtGenerator;