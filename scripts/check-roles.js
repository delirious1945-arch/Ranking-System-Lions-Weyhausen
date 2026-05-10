const { Client } = require('pg');
require('dotenv').config();

const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

c.connect()
  .then(() => c.query('SELECT player_name, role FROM "UserPassword"'))
  .then(r => {
    console.log('=== User Roles in Production DB ===');
    r.rows.forEach(row => console.log(`  ${row.player_name}: ${row.role}`));
    c.end();
  })
  .catch(e => { console.error(e); c.end(); });
