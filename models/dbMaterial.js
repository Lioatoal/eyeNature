var DB = require('./dbConnection');

DB.knex.schema.hasTable('inventory').then(function(exists) {
    if (!exists) {
        console.log('inventory is not exist!');
    }
});

DB.knex.schema.hasTable('inventory_comb').then(function(exists) {
    if (!exists) {
        console.log('inventory_comb is not exist!');
    }
});

DB.knex.schema.hasTable('inventory_type').then(function(exists) {
    if (!exists) {
        console.log('inventory_type is not exist!');
    }
});

DB.knex.schema.hasTable('inventory_location').then(function(exists) {
    if (!exists) {
        console.log('inventory_location is not exist!');
    }
});

DB.knex.schema.hasTable('vendor').then(function(exists) {
    if (!exists) {
        console.log('vendor is not exist!');
    }
});

DB.knex.schema.hasTable('employee').then(function(exists) {
    if (!exists) {
        console.log('employee is not exist!');
    }
});

DB.knex.schema.hasTable('materialrecords').then(function(exists) {
    if (!exists) {
        console.log('materialrecords is not exist!');
    }
});

var inventory = DB.Model.extend({
   tableName: 'inventory',
   idAttribute: 'id',
});

var inventory_comb = DB.Model.extend({
   tableName: 'inventory_comb',
   idAttribute: 'id',
});

var inventory_type = DB.Model.extend({
   tableName: 'inventory_type',
   idAttribute: 'id',
});

var inventory_location = DB.Model.extend({
   tableName: 'inventory_location',
   idAttribute: 'id',
});

var vendor = DB.Model.extend({
    tableName: 'vendor',
    idAttribute: 'id',
});

var employee = DB.Model.extend({
    tableName:'employee',
    idAttribute:'id',
});

var materialrecords = DB.Model.extend({
    tableName:'materialrecords',
    isAttribute: 'id',
});

module.exports = {
    inventory: inventory,
    inventory_comb: inventory_comb,
    inventory_type: inventory_type,
    inventory_location: inventory_location,
    vendor: vendor,
    employee: employee,
    materialrecords: materialrecords
};
