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
    let msg;
    if (err.sqlMessage !== undefined) {
        console.log(err.sqlMessage);
        msg = 'Server error (SQL)';
    } else
        msg = err;
    res.json({
        status: -1,
        reason: msg
    });
}

/* DEADLINE */
app.get('/api/deadline', (req, res) => {
    console.log('GET /api/deadline', req.body);

    const q = `
        SELECT * FROM deadline
        LEFT JOIN user_course ON deadline.course_id = user_course.course_id
        LEFT JOIN user ON deadline.user_id = user.id OR user_course.user_id = user.id
        WHERE user.token = ?
    `;
    const data = [req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        res.json({
            status: 1,
            reason: 'Success',
            deadlines: result.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                time: r.time,
                done: r.done
            }))
        });
    });
});
app.post('/api/deadline', (req, res) => {
    console.log('POST /api/deadline', req.body);
    const q = `
        INSERT INTO deadline (title, description, time, course_id, user_id)
        VALUE (?, ?, ?, NULL, (SELECT id FROM user WHERE token = ?));
    `;
    const data = [req.body.title, req.body.description, req.body.time, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        } else GG(res, 'Token error');
    });
});

/* NOTICE */
app.get('/api/notice', (req, res) => {
    console.log('GET /api/notice', req.body);

    const q = `
        SELECT * FROM notice
        LEFT JOIN user_course ON notice.course_id = user_course.course_id
        LEFT JOIN user ON notice.user_id = user.id OR user_course.user_id = user.id
        WHERE user.token = ?
    `;
    const data = [req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        res.json({
            status: 1,
            reason: 'Success',
            notices: result.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description
            }))
        });
    });
});
app.post('/api/notice', (req, res) => {
    console.log('POST /api/notice', req.body);
    const q = `
        INSERT INTO notice (title, description, course_id, user_id)
        VALUE (?, ?, NULL, (SELECT id FROM user WHERE token = ?));
    `;
    const data = [req.body.title, req.body.description, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        } else GG(res, 'Token error');
    });
});

/* USER */
app.put('/api/user', (req, res) => {
    console.log('POST /api/user', req.body);
    const q = 'INSERT INTO user ( username, password, nickname ) VALUE (?, ?, ?)';
    const data = [req.body.username, req.body.password, req.body.nickname];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        }
    });
});
app.post('/api/user', (req, res) => {
    console.log('POST /api/user', req.body);
    const q = 'UPDATE user SET password = ?, nickname = ? WHERE token = ?';
    const data = [req.body.password, req.body.nickname, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows > 0) {
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
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.length > 0) {
            res.json({
                status: 1,
                reason: 'Success',
                username: result[0].username,
                nickname: result[0].nickname
            });
        } else GG(res, 'Token error');
    });
});
app.get('/api/login', (req, res) => {
    console.log('GET /api/login', req.body);
    const token = uuid();
    console.log(`Generate UUID: ${token}`);
    const q = 'UPDATE user SET token = ? WHERE username = ? AND password = ?';
    const data = [token, req.body.username, req.body.password];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows > 0) {
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

