var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'login'
});
db.connect();

module.exports = db;