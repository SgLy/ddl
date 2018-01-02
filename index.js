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
        SELECT deadline.* FROM deadline
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
app.put('/api/deadline/:id', (req, res) => {
    console.log('PUT /api/deadline/', req.params.id, req.body);
    const q = `UPDATE deadline SET done = TRUE WHERE id = ?
        AND user_id = (SELECT id FROM user WHERE token = ?)`;
    const data = [req.params.id, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success'
            });
        } else
            GG(res, 'Token or id error');
    });
});
app.delete('/api/deadline/:id', (req, res) => {
    console.log('DELETE /api/deadline/', req.params.id, req.body);
    const q = `DELETE FROM deadline WHERE id = ?
        AND user_id = (SELECT id FROM user WHERE token = ?)`;
    const data = [req.params.id, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success'
            });
        } else
            GG(res, 'Token or id error');
    });
});

/* NOTICE */
app.get('/api/notice', (req, res) => {
    console.log('GET /api/notice', req.body);

    const q = `
        SELECT notice.* FROM notice
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
app.delete('/api/notice/:id', (req, res) => {
    console.log('DELETE /api/notice/', req.params.id, req.body);
    const q = `DELETE FROM notice WHERE id = ?
        AND user_id = (SELECT id FROM user WHERE token = ?)`;
    const data = [req.params.id, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success'
            });
        } else
            GG(res, 'Token or id error');
    });
});

/* CHATS */
app.get('/api/chats', (req, res) => {
    console.log('GET /api/chats', req.body);
    const q = `
        SELECT course.id, chat.content, user.nickname, course.name from chat
        LEFT JOIN course ON chat.course_id = course.id
        LEFT JOIN user ON chat.user_id = user.id
        LEFT JOIN user_course ON chat.course_id = user_course.course_id
        WHERE user_course.user_id = (SELECT id FROM user WHERE token = ?)
        GROUP BY chat.course_id ORDER BY time DESC
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
            chats: result.map(r => ({
                id: r.id,
                title: r.name,
                last_nickname: r.nickname,
                last_message: r.content
            }))
        });
    });
});
app.get('/api/chat/:id', (req, res) => {
    console.log('GET /api/chat/', req.params.id, req.body);
    const q = `
        SELECT chat.*, user.token, user.nickname from chat
        LEFT JOIN user ON chat.user_id = user.id
        LEFT JOIN user_course ON chat.course_id = user_course.course_id
        WHERE chat.course_id = ? AND chat.id > ?
            AND user_course.user_id = (SELECT id FROM user WHERE token = ?)
        ORDER BY time ASC
    `;
    const data = [req.params.id, req.body.last_message_id, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        res.json({
            status: 1,
            reason: 'Success',
            messages: result.map(r => ({
                id: r.id,
                time: r.time,
                nickname: r.nickname,
                self: r.token === req.body.token,
                content: r.content
            }))
        });
    });
});
app.post('/api/chat/:id', (req, res) => {
    console.log('POST /api/chat/', req.params.id, req.body);
    const q = `
        INSERT INTO chat (course_id, user_id, time, content)
        VALUES (?, (
            SELECT user.id FROM user_course
            LEFT JOIN user ON user.id = user_course.user_id
            WHERE user_course.course_id = ? AND token = ?
        ), NOW(), ?)
    `;
    const data = [req.params.id, req.params.id, req.body.token, req.body.content];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            console.log(result);
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        } else
            GG(res, 'Token or course id error');
    });
});

/* COURSE */
app.get('/api/course', (req, res) => {
    console.log('GET /api/course', req.body);
    const q = 'SELECT * FROM course';
    const data = [];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        res.json({
            courses: result.map(r => ({
                id: r.id,
                name: r.name,
                semester: r.semester
            }))
        });
    });
});
app.post('/api/course', (req, res) => {
    console.log('POST /api/course', req.body);
    const q = 'INSERT INTO course (name, semester) VALUES (?, ?)';
    const data = [req.body.name, req.body.semester];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                id: result.insertId
            });
        } else
            GG(res, 'Error');
    });
});
app.post('/api/course/:cid/user/:uid', (req, res) => {
    console.log('POST /api/course/user', req.params.cid, req.params.uid, req.body);
    const q = 'INSERT INTO user_course (user_id, course_id) VALUES (?, ?)';
    const data = [req.params.uid, req.params.cid];
    connection.query(q, data, (err, result) => {
        if (err) {
            GG(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                id: result.insertId
            });
        } else
            GG(res, 'Error');
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

