const { Client } = require('pg');

const client = new Client({ 
  connectionString: process.env.DIRECT_URL 
});

client.connect()
  .then(() => client.query('SELECT * FROM "ManualGame" LIMIT 2'))
  .then(res => {
    console.log("Database Columns:");
    console.log(res.fields.map(f => f.name));
    console.log("\nSample Data:");
    console.log(JSON.stringify(res.rows, null, 2));
  })
  .catch(console.error)
  .finally(() => client.end());
