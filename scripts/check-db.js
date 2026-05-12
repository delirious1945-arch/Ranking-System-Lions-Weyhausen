const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query('SELECT player_name, total_points, points_k4 FROM "SnapshotPlayerValue" WHERE player_name = \'Sebastian Kirste\'');
  console.log('DB Check Sebastian Kirste:', res.rows[0]);
  
  const config = await pool.query('SELECT * FROM "RankingConfig" WHERE id = 1');
  console.log('Config weights:', config.rows[0]);
  
  pool.end();
}
run();
