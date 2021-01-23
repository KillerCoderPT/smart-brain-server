const knex = require('knex');

// ENV File config
require('dotenv').config();

const ConnectionProd = () => {
    // Database KNEX connection to Postgres
    return knex({
        client: 'pg',
        connection: process.env.DATABASE_URL
    });
}

const ConnectionDev = () => {
    // Database KNEX connection to Postgres
    return knex({
        client: 'pg',
        connection: {
            host : process.env.POSTGRES_HOST,
            user : process.env.POSTGRES_USER,
            password : process.env.POSTGRES_PASS,
            database : process.env.POSTGRES_DB
        }
    });
}

module.exports = {
    ConnectionProd,
    ConnectionDev
}