'use strict';

/* Express.js */
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('static'));

/* Nunjucks */
const expressNunjucks = require('express-nunjucks');
app.set('views', __dirname + '/templates');
expressNunjucks(app, {
    watch: true,
    noCache: true
});

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

/* Moment */
const moment = require('moment');

function responseError(res, err) {
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
    console.log('GET /api/deadline', req.query);

    const q = `
        SELECT deadline.*, course.name as "course_name" FROM deadline
        LEFT JOIN user_course ON deadline.course_id = user_course.course_id
        LEFT JOIN user ON deadline.user_id = user.id OR user_course.user_id = user.id
        LEFT JOIN course ON deadline.course_id = course.id
        WHERE user.token = ?
    `;
    const data = [req.query.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        res.json({
            status: 1,
            reason: 'Success',
            deadlines: result.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                course_name: r.course_name,
                time: moment(r.time).format('x'),
                done: r.done
            }))
        });
    });
});
app.post('/api/deadline', (req, res) => {
    console.log('POST /api/deadline', req.body);
    const time = moment(parseInt(req.body.time)).format('YYYY-MM-DD HH:mm:ss');
    const q = `
        INSERT INTO deadline (title, description, time, course_id, user_id)
        VALUE (?, ?, ?, NULL, (SELECT id FROM user WHERE token = ?));
    `;
    const data = [req.body.title, req.body.description, time, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        } else responseError(res, 'Token error');
    });
});
app.put('/api/deadline/:id', (req, res) => {
    console.log('PUT /api/deadline/', req.params.id, req.body);
    const q = `UPDATE deadline SET done = TRUE WHERE id = ?
        AND user_id = (SELECT id FROM user WHERE token = ?)`;
    const data = [req.params.id, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success'
            });
        } else
            responseError(res, 'Token or id error');
    });
});
app.delete('/api/deadline/:id', (req, res) => {
    console.log('DELETE /api/deadline/', req.params.id, req.body);
    const q = `DELETE FROM deadline WHERE id = ?
        AND user_id = (SELECT id FROM user WHERE token = ?)`;
    const data = [req.params.id, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success'
            });
        } else
            responseError(res, 'Token or id error');
    });
});

/* NOTICE */
app.get('/api/notice', (req, res) => {
    console.log('GET /api/notice', req.query);

    const q = `
        SELECT notice.*, course.name as "course_name" FROM notice
        LEFT JOIN user_course ON notice.course_id = user_course.course_id
        LEFT JOIN user ON notice.user_id = user.id OR user_course.user_id = user.id
        LEFT JOIN course ON notice.course_id = course.id
        WHERE user.token = ?
    `;
    const data = [req.query.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        res.json({
            status: 1,
            reason: 'Success',
            notices: result.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                couser_name: r.course_name
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
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        } else responseError(res, 'Token error');
    });
});
app.delete('/api/notice/:id', (req, res) => {
    console.log('DELETE /api/notice/', req.params.id, req.body);
    const q = `DELETE FROM notice WHERE id = ?
        AND user_id = (SELECT id FROM user WHERE token = ?)`;
    const data = [req.params.id, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success'
            });
        } else
            responseError(res, 'Token or id error');
    });
});

/* CHATS */
app.get('/api/chats', (req, res) => {
    console.log('GET /api/chats', req.query);
    const q = `
        SELECT course.id, chat.content, user.nickname, course.name from chat
        INNER JOIN (SELECT course_id, MAX(time) as lastest FROM chat GROUP BY course_id) r
        ON chat.time = lastest AND chat.course_id = r.course_id
        LEFT JOIN course ON chat.course_id = course.id
        LEFT JOIN user ON chat.user_id = user.id
        LEFT JOIN user_course ON chat.course_id = user_course.course_id
        WHERE user_course.user_id = (SELECT id FROM user WHERE token = ?)
    `;
    const data = [req.query.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
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
    console.log('GET /api/chat/', req.params.id, req.query);
    const q = `
        SELECT chat.*, user.token, user.nickname from chat
        LEFT JOIN user ON chat.user_id = user.id
        LEFT JOIN user_course ON chat.course_id = user_course.course_id
        WHERE chat.course_id = ? AND chat.id > ?
            AND user_course.user_id = (SELECT id FROM user WHERE token = ?)
        ORDER BY time ASC
    `;
    const data = [req.params.id, req.query.last_message_id, req.query.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
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
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        } else
            responseError(res, 'Token or course id error');
    });
});

/* USER */
app.put('/api/user', (req, res) => {
    console.log('POST /api/user', req.body);
    const q = 'INSERT INTO user ( username, password, stuid, nickname ) VALUE (?, ?, ?, ?)';
    const data = [req.body.username, req.body.password, req.body.stuid, req.body.nickname];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
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
    const q = 'UPDATE user SET password = ?, stuid = ?, nickname = ? WHERE token = ?';
    const data = [req.body.password, req.body.stuid, req.body.nickname, req.body.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows > 0) {
            res.json({
                status: 1,
                reason: 'Success'
            });
        } else responseError(res, 'Token error');
    });
});
app.get('/api/user', (req, res) => {
    console.log('GET /api/user', req.query);
    const q = 'SELECT * FROM user WHERE token = ?';
    const data = [req.query.token];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.length > 0) {
            res.json({
                status: 1,
                reason: 'Success',
                username: result[0].username,
                nickname: result[0].nickname,
                stuid: result[0].stuid
            });
        } else responseError(res, 'Token error');
    });
});
app.get('/api/login', (req, res) => {
    console.log('GET /api/login', req.query);
    const token = uuid();
    console.log(`Generate UUID: ${token}`);
    const q = 'UPDATE user SET token = ? WHERE username = ? AND password = ?';
    const data = [token, req.query.username, req.query.password];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows > 0) {
            res.json({
                status: 1,
                reason: 'Success',
                token: token
            });
        } else responseError(res, 'Username or password error');
    });
});

/* ADMIN */
/* COURSE */
app.get('/api/admin/course', (req, res) => {
    console.log('GET /api/admin/course', req.query);
    if (req.query.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    const q = 'SELECT * FROM course';
    const data = [];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        res.json({
            courses: result.map(r => ({
                id: r.id,
                name: r.name,
                semester: r.semester,
                teacher: r.teacher
            }))
        });
    });
});
app.post('/api/admin/course', (req, res) => {
    console.log('POST /api/admin/course', req.body);
    if (req.body.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    const q = 'INSERT INTO course (name, teacher, semester) VALUES (?, ?, ?)';
    const data = [req.body.name, req.body.teacher, req.body.semester];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                id: result.insertId
            });
        } else
            responseError(res, 'Error');
    });
});
app.get('/api/admin/course/user', (req, res) => {
    console.log('POST /api/admin/course/user');
    if (req.query.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    const q = 'SELECT * FROM user_course';
    const data = [];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        res.json({
            user_courses: result.map(r => ({
                id: r.id,
                user_id: r.user_id,
                course_id: r.course_id
            }))
        });
    });
});
app.post('/api/admin/course/:cid/user/:uid', (req, res) => {
    console.log('POST /api/admin/course/user', req.params.cid, req.params.uid, req.body);
    if (req.body.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    const q = 'INSERT INTO user_course (user_id, course_id) VALUES (?, ?)';
    const data = [req.params.uid, req.params.cid];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                id: result.insertId
            });
        } else
            responseError(res, 'Error');
    });
});
/* Admin get all apis */
app.get('/api/admin/user', (req, res) => {
    console.log('GET /api/admin/user');
    if (req.query.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    let q = 'SELECT * FROM user';
    let data = [];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        res.json({
            users: result.map(r => ({
                id: r.id,
                username: r.username,
                password: r.password,
                stuid: r.stuid,
                nickname: r.nickname
            }))
        });
    });
});
app.get('/api/admin/deadline', (req, res) => {
    console.log('GET /api/admin/deadline');
    if (req.query.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    let q = 'SELECT * FROM deadline';
    let data = [];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        res.json({
            deadlines: result.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                time: r.time,
                done: r.done === 1,
                course_id: r.course_id,
                user_id: r.user_id
            }))
        });
    });
});
app.post('/api/admin/deadline', (req, res) => {
    console.log('POST /api/admin/deadline', req.body);
    if (req.body.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    const q = `
        INSERT INTO deadline (title, description, time, course_id, user_id)
        VALUE (?, ?, ?, ?, NULL);
    `;
    const data = [req.body.title, req.body.description, req.body.time, req.body.course_id];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        } else responseError(res, 'Token error');
    });
});
app.get('/api/admin/notice', (req, res) => {
    console.log('GET /api/admin/notice');
    if (req.query.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    let q = 'SELECT * FROM notice';
    let data = [];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        res.json({
            notices: result.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                course_id: r.course_id,
                user_id: r.user_id
            }))
        });
    });
});
app.post('/api/admin/notice', (req, res) => {
    console.log('POST /api/admin/notice', req.body);
    if (req.body.admin_token !== admin_token) {
        res.json({ status: -1, reason: 'Admin required' });
        return;
    }
    const q = `
        INSERT INTO notice (title, description, course_id, user_id)
        VALUE (?, ?, ?, NULL);
    `;
    const data = [req.body.title, req.body.description, req.body.course_id];
    connection.query(q, data, (err, result) => {
        if (err) {
            responseError(res, err);
            return;
        }
        if (result.affectedRows === 1) {
            res.json({
                status: 1,
                reason: 'Success',
                id: result.insertId
            });
        } else responseError(res, 'Token error');
    });
});

['course', 'deadline', 'notice', 'user', 'user_course'].forEach(type => {
    app.delete(`/api/admin/${type}`, (req, res) => {
        console.log('DELETE /api/admin/' + type, req.body);
        if (req.body.admin_token !== admin_token) {
            res.json({ status: -1, reason: 'Admin required' });
            return;
        }
        const q = `DELETE FROM ${type} WHERE id = ?`;
        const data = [req.body.id];
        connection.query(q, data, (err, result) => {
            if (err) {
                responseError(res, err);
                return;
            }
            if (result.affectedRows === 1) {
                res.json({
                    status: 1,
                    reason: 'Success'
                });
            } else responseError(res, 'Token error');
        });
    });
});

/* GLOBAL */
app.get('/', (req, res) => {
    res.send('DDL backend working.');
});

app.get('/ddl', (req, res) => {
    res.sendFile(__dirname + '/static/html/ddl.html');
});

let admin_token = uuid();
app.get('/admin', (req, res) => {
    res.render('admin', { admin_token });
});

app.listen(5000, () => {
    console.log('listening 5000');
});

