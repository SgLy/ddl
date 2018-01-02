/* Express.js */
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

/* MySQL */
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'ddl',
    password: 'ddl',
    database: 'ddl'
});
connection.connect();

/* UUID */
const uuid = require('uuid/v1');

function GG(res, err) {
    res.json({
        status: -1,
        reason: 'Error!'
    });
}

/* USER */
app.put('/api/user', (req, res) => {
    console.log('POST /api/user', req.body);
    const q = 'INSERT INTO user ( username, password, nickname ) VALUE (?, ?, ?)';
    const data = [req.body.username, req.body.password, req.body.nickname];
    connection.query(q, data, (err, rows) => {
        if (err) GG(res, err);
        const q = 'SELECT * FROM user WHERE username = ?';
        connection.query(q, [req.body.username], (err, rows) => {
            if (err) GG(res, err);
            res.json({
                status: 1,
                reason: 'Success',
                id: rows[0].id
            });
        });
    });
});
app.get('/api/login', (req, res) => {
    console.log('GET /api/login', req.body);
    const q = 'SELECT * FROM user WHERE username = ? AND password = ?';
    const data = [req.body.username, req.body.password];
    connection.query(q, data, (err, rows) => {
        if (err) GG(res, err);
        if (rows.length > 0) {
            const token = uuid();
            console.log(token);
            const q = 'UPDATE user SET token = ? WHERE id = ?';
            const data = [token, rows[0].id];
            connection.query(q, data, (err, rows) => {
                if (err) GG(res, err);
                res.json({
                    status: 1,
                    reason: 'Success',
                    token: token
                });
            });
        }
    });
});

/* GLOBAL */
app.get('/', (req, res) => {
    res.send('DDL backend working.');
});

app.listen(5000, () => {
    console.log('listening 5000');
});

