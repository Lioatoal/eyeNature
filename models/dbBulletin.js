var DB = require('./dbConnection');

DB.knex.schema.hasTable('bulletin').then(function(exists) {
    if (!exists) {
        console.log('bulletin is not exist!');
    }
});

DB.knex.schema.hasTable('bltn_comment').then(function(exists) {
    if (!exists) {
        console.log('bltn_comment is not exist!');
    }
});

DB.knex.schema.hasTable('bltn_looked').then(function(exists) {
    if (!exists) {
        console.log('bltn_looked is not exist!');
    }
});

DB.knex.schema.hasTable('bltn_willlook').then(function(exists) {
    if (!exists) {
        console.log('bltn_willlook is not exist!');
    }
});

var bulletin = DB.Model.extend({
   tableName: 'bulletin',
   idAttribute: 'id',
});

var bltn_comment = DB.Model.extend({
   tableName: 'bltn_comment',
   idAttribute: 'id',
});

var bltn_looked = DB.Model.extend({
   tableName: 'bltn_looked',
   idAttribute: 'id',
});

var bltn_willlook = DB.Model.extend({
    tableName: 'bltn_willlook',
    idAttribute: 'id',
 });
 

module.exports = {
   bulletin: bulletin,
   bltnComment: bltn_comment,
   bltnLooked: bltn_looked,
   bltnWilllook: bltn_willlook
};
