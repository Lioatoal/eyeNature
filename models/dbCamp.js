var DB = require('./dbConnection');

DB.knex.schema.hasTable('camp').then(function(exists) {
    if (!exists) {
        console.log('camp is not exist!');
    }
});

DB.knex.schema.hasTable('camp_inv').then(function(exists) {
    if (!exists) {
        console.log('camp_inv is not exist!');
    }
});

var camp = DB.Model.extend({
   tableName: 'camp',
   idAttribute: 'camp_id',
});

var camp_inv = DB.Model.extend({
   tableName: 'camp_inv',
   idAttribute: 'camp_inv_id',
});

module.exports = {
    camp: camp,
    camp_inv: camp_inv
};
