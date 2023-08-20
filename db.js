var mysql = require('mysql2');
var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1111',
    database: 'login'
});
db.connect();

module.exports = db;