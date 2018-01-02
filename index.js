'use strict';

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
        reason: err
    });
}

/* USER */
app.put('/api/user', (req, res) => {
    console.log('POST /api/user', req.body);
    const q = 'INSERT INTO user ( username, password, nickname ) VALUE (?, ?, ?)';
    const data = [req.body.username, req.body.password, req.body.nickname];
    connection.query(q, data, (err, rows) => {
        if (err) GG(res, err);
        if (rows.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: rows.insertId
            });
        }
    });
});
app.post('/api/user', (req, res) => {
    console.log('POST /api/user', req.body);
    const q = 'UPDATE user SET password = ?, nickname = ? WHERE token = ?';
    const data = [req.body.password, req.body.nickname, req.body.token];
    connection.query(q, data, (err, rows) => {
        if (err) GG(res, err);
        if (rows.affectedRows > 0) {
            res.json({
                status: 1,
                reason: 'Success'
            });
        } else GG(res, 'Token error');
    });
});
app.get('/api/user', (req, res) => {
    console.log('GET /api/user', req.body);
    const q = 'SELECT * FROM user WHERE token = ?';
    const data = [req.body.token];
    connection.query(q, data, (err, rows) => {
        if (err) GG(res, err);
        if (rows.length > 0) {
            res.json({
                status: 1,
                reason: 'Success',
                username: rows[0].username,
                nickname: rows[0].nickname
            });
        } else GG(res, 'Token error');
    });
});
app.get('/api/login', (req, res) => {
    console.log('GET /api/login', req.body);
    const token = uuid();
    console.log(token);
    const q = 'UPDATE user SET token = ? WHERE username = ? AND password = ?';
    const data = [token, req.body.username, req.body.password];
    connection.query(q, data, (err, rows) => {
        if (err) GG(res, err);
        if (rows.affectedRows > 0) {
            res.json({
                status: 1,
                reason: 'Success',
                token: token
            });
        } else GG(res, 'Username or password error');
    });
});

/* GLOBAL */
app.get('/', (req, res) => {
    res.send('DDL backend working.');
});

app.listen(5000, () => {
    console.log('listening 5000');
});

