const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "rishal@1999",
  host: "localhost",
  port: 5432,
  database: "threeway",
});

module.exports = pool;