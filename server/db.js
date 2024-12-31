const { Pool } = require('pg')
require('dotenv').config()
const fs = require('fs')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    port: 5432,
    max: 20,
    ssl: {
      ca: fs.readFileSync('./us-east-2-bundle.pem').toString(),
      rejectUnauthorized: true,
    },
  });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
