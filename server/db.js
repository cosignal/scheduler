const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    port: 5432,
    max: 20,
    ssl: {
      rejectUnauthorized: false,  // This disables the certificate validation
      // FIXME: for production, use proper SSL cert thru AWS
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
