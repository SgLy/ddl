const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'ddl',
    password: 'ddl',
    database: 'ddl'
});
connection.connect();

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

/* GLOBAL */
app.get('/', (req, res) => {
    res.send('DDL backend working.');
});

app.listen(5000, () => {
    console.log('listening 5000');
});

