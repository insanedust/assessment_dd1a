const {Client} = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'menudb',
    password: 'testpassword',
    port: 5432,
});

module.exports = client;