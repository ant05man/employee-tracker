//mysql connection
const connection = mysql.createConnection({
    host: 'localhost',

    //PORT
    port: 3001,

    // Your username
    user: 'root',

    // Your password
    password: '',
    database: 'employees_db'
});