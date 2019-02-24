var fs = require('fs');
var dbConfig = JSON.parse(fs.readFileSync("./config.json")).db;
var knex = require('knex')(dbConfig.mysql);

var database = require('bookshelf')(knex);
database.plugin('pagination')

module.exports = database
