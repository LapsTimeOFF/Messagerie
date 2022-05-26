const app = require('express')();
const chalk = require('chalk');
const mysql = require('mysql');

log = console.log;

const MAINTENANCE = [
    "/api/v1/user/info"
];

var statusMySQL = false;

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Quentin/200931',
    database : 'messagerie'
});

connection.connect(function(err) {
    if (err) {
      console.error('Error during MySQL connection: ' + err.stack);
      log('Continue with error');
      statusMySQL = false;
      return;
    };
   
    statusMySQL = true;
    console.log('Connected with threadID = ' + connection.threadId);
});

// Config files

const config = {};

config.api = require('./configs/api.json');


app.get('/api/v1/info', (_,res) => {
    res.statusCode = statusMySQL ? 200 : 502;
    res.send({
        "status": statusMySQL ? "OK" : "Module in error",
        "code": res.statusCode,
        "modules": {
            "mysql": statusMySQL
        }
    });
});

app.get('/api/v1/user/info', (req, res) => {
    var headers = req.headers;
    // log(headers.token);

    if(MAINTENANCE.includes("/api/v1/user/info")) {
        if(headers.skip503 !== "yes") {
            res.statusCode = 503;
            res.send("Enable to get suite to your request for MAINTENANCE.");
            return;
        };
    };

    if(!headers.token) {
        res.statusCode = 401;
        res.send("Enable to get suite to your request for 401 User not authentificated.");
        return;
    };

    

});


app.listen(config.api.port, () => {
    log(`[${chalk.bgGreen('API OK')}] Listening on http://localhost:${config.api.port}/`);
});

