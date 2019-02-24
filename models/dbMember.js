var DB = require('./dbConnection');

DB.knex.schema.hasTable('member').then(function(exists) {
    if (!exists) {
        console.log('member is not exist!');
    }
});

DB.knex.schema.hasTable('role').then(function(exists) {
    if (!exists) {
        console.log('role is not exist!');
    }
});

DB.knex.schema.hasTable('module').then(function(exists) {
    if (!exists) {
        console.log('module is not exist!');
    }
});

DB.knex.schema.hasTable('permission').then(function(exists) {
    if (!exists) {
        console.log('permission is not exist!');
    }
});

var member = DB.Model.extend({
   tableName: 'member',
   idAttribute: 'email',
});

var role = DB.Model.extend({
   tableName: 'role',
   idAttribute: 'id',
});

var modules = DB.Model.extend({
   tableName: 'module',
   idAttribute: 'id',
});

var permission = DB.Model.extend({
   tableName: 'permission',
   idAttribute: 'id',
});

module.exports = {
    member: member,
    role: role,
    modules: modules,
    permission: permission
};
