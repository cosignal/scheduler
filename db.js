const { Pool } = require('pg')

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'api',
    password: 'pregres',
    port: 5432,
    max: 20,
  });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
