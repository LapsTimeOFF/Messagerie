const app = require('express')();
const chalk = require('chalk');
const mysql = require('mysql');
const morgan = require('morgan')
const bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

log = console.log;
var logid = "";

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

app.use(morgan('dev'))

var sql = ""

const MAINTENANCE = [
    // "/api/v1/sqlmanual"
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


app.get('/api/v1/info', (req,res) => {
    logid = makeid(6)
    res.statusCode = statusMySQL ? 200 : 502;
    res.send({
        "status": statusMySQL ? "OK" : "Module in error",
        "code": res.statusCode,
        "modules": {
            "mysql": statusMySQL
        },
        "logid": logid
    });
    var timestamp = `${Date.now()}`
    sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "api/info", "NO REQUIRE", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
    connection.query(sql, (err) => {
        if(err) throw err;
    })
});

app.get('/api/v1/user', (req, res) => {
    var timestamp = `${Date.now()}`
    logid = makeid(6)
    var headers = req.headers;
    var body = req.body;
    // log(body.userid)
    // log(headers.token);
    if(MAINTENANCE.includes("/api/v1/user/info")) {
        if(headers.skip503 !== "yes") {
            res.statusCode = 503;
            res.send("Enable to get suite to your request for MAINTENANCE.");
            sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "user/info", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
            return;
        };
    };

    if(!headers.token) {
        res.statusCode = 401;
        res.send("Enable to get suite to your request for 401 User not authentificated.");
        sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "user/info", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
        return;
    };
    if(body.userid === undefined) {
        res.statusCode = 400;
        res.send("Enable to get suite to your request for 400 Bad request.");
        sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "user/info", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
        return;
    };

    sql = `SELECT * FROM users WHERE token = '${headers.token}'`

    connection.query(sql, (err, result) => {
        if(err) {
            res.statusCode = 500
            res.send({
                "status": "Error",
                "code": res.statusCode,
                "when": "query user from token",
                "var": {
                    "sql": sql,
                    "headers.token": headers.token,
                    "err": err
                },
                "logid": logid
            });
            console.error(err);
            sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "user/info", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
            return;
        }
        if(result.length === 0) {
            res.statusCode = 498
            res.send({
                "status": "Error",
                "code": res.statusCode,
                "err": "Token expired or invalid",
                "cause": "SQLDB return result.length = 0",
                "logid": logid
            });
            sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "user/info", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
            return;
        }
        sql = `SELECT * FROM users WHERE id = ${body.userid}`
        connection.query(sql, (err, result) => {
            if(err) {
                res.statusCode = 500
                res.send({
                    "status": "Error",
                    "code": res.statusCode,
                    "when": "query user from token",
                    "var": {
                        "sql": sql,
                        "headers.token": headers.token,
                        "err": err
                    },
                    "logid": logid
                });
                console.error(err);
                sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "user/info", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
                connection.query(sql, (err) => {
                    if(err) throw err;
                })
                return;
            }
            if(result.length === 0) {
                res.statusCode = 404
                res.send({
                    "status": "failed",
                    "code": res.statusCode,
                    "err": "No user with id = " + body.userid,
                    "logid": logid
                })
                sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "user/info", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
                connection.query(sql, (err) => {
                    if(err) throw err;
                })
                return;
            }
            res.statusCode = 200;
            res.send(result);
            sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "user/info", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
                connection.query(sql, (err) => {
                    if(err) throw err;
                })
        })
    })

});

app.post('/api/v1/sqlmanual', (req,res) => {
    var timestamp = `${Date.now()}`
    var headers = req.headers;
    var body = req.body;
    var logid = makeid(6)
    
    if(MAINTENANCE.includes("/api/v1/sqlmanual")) {
        if(headers.skip503 !== "yes") {
            res.statusCode = 503;
            res.send(`Enable to get suite to your request for MAINTENANCE. logid: ${logid}`);
            sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "sql/manual", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
            return;
        };
    };

    if(!headers.token) {
        res.statusCode = 401;
        res.send(`Enable to get suite to your request for 401 User not authentificated. logid: ${logid}`);
        sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "sql/manual", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
        return;
    };


    sql = `SELECT * FROM users WHERE token = '${headers.token}'`

    connection.query(sql, (err, result) => {
        if(err) {
            res.statusCode = 500
            res.send({
                "status": "Error",
                "code": res.statusCode,
                "when": "query user from token",
                "var": {
                    "sql": sql,
                    "headers.token": headers.token,
                    "err": err
                },
                "logid": logid
            });
            console.error(err);
            sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "sql/manual", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
            return;
        }
        if(result.length === 0) {
            res.statusCode = 498
            res.send({
                "status": "Error",
                "code": res.statusCode,
                "err": "Token expired or invalid",
                "cause": "SQLDB return result.length = 0",
                "logid": logid
            });
            sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "sql/manual", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
            return;
        }

        connection.query(body.sqlcommand, (err, result) => {
            res.statusCode = err ? 500 : 200
            res.send({
                "result": result,
                "err": err,
                "logid": logid
            })
            sql = `INSERT INTO log (logid, type, token, code, timestamp, ip) VALUES ("${logid}", "sql/manual", "${headers.token}", ${res.statusCode}, "${timestamp.substring(0,10)}", "${req.ip.substring(7)}")`
            connection.query(sql, (err) => {
                if(err) throw err;
            })
        })
    })
})


app.listen(config.api.port, () => {
    log(`[${chalk.bgGreen('API OK')}] Listening on http://localhost:${config.api.port}/`);
});

