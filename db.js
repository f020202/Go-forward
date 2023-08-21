var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'locallost',
    user: 'root',
    password: '1111',
    database: 'login'
});
db.connect();

module.exports = db;