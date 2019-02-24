var DB = require('./dbConnection');

DB.knex.schema.hasTable('vendor').then(function(exists) {
    if (!exists) {
        console.log('vendor is not exist!');
    }
});

DB.knex.schema.hasTable('vendor_type').then(function(exists) {
    if (!exists) {
        console.log('vendor_type is not exist!');
    }
});

DB.knex.schema.hasTable('customer').then(function(exists) {
    if (!exists) {
        console.log('customer is not exist!');
    }
});

DB.knex.schema.hasTable('customer_child').then(function(exists) {
    if (!exists) {
        console.log('customer_child is not exist!');
    }
});

DB.knex.schema.hasTable('employee').then(function(exists) {
    if (!exists) {
        console.log('employee is not exist!');
    }
});

DB.knex.schema.hasTable('employee_edu').then(function(exists) {
    if (!exists) {
        console.log('employee_edu is not exist!');
    }
});

DB.knex.schema.hasTable('employee_title').then(function(exists) {
    if (!exists) {
        console.log('employee_title is not exist!');
    }
});

var vendor = DB.Model.extend({
    tableName: 'vendor',
    idAttribute: 'id',
});

var vendor_type = DB.Model.extend({
    tableName: 'vendor_type',
    idAttribute: 'id',
});

var customer = DB.Model.extend({
    tableName:'customer',
    idAttribute:'idcardno',
});

var customer_child = DB.Model.extend({
    tableName:'customer_child',
    idAttribute:'idcardno',
}); 

var employee = DB.Model.extend({
    tableName:'employee',
    idAttribute:'id',
});

var employee_edu = DB.Model.extend({
    tableName:'employee_edu',
    idAttribute:'id',
});

var employee_title = DB.Model.extend({
    tableName:'employee_title',
    idAttribute:'id',
});

module.exports = {
    vendor: vendor,
    vendor_type:vendor_type,
    employee : employee,
    employee_edu : employee_edu,
    employee_title : employee_title,
    customer : customer,
    customer_child:customer_child
};