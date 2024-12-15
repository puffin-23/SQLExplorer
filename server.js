const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8580;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());

// Настроим соединение с базой данных MySQL
const poolConfig = {
    connectionLimit : 2,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'learning_db'
};

let pool = mysql.createPool(poolConfig);

// Обработка SQL запросов
app.post('/execute', async (req, res) => {
    
    const query = req.body.query

    let connection=null;
    try {
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    console.log(err);
                    
                    reject(err);
                } else {
                    console.log('connection created');
                    resolve(conn);
                }
            });
        })

        connection.query(query, (error, results) => { //два аргумента: SQL запрос и колбэк, который будет вызван после выполнения запроса
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (results.length === undefined) { //определения, был ли выполнен модифицирующий SQL запрос (например, INSERT, UPDATE или DELETE), который, как правило, не возвращает массив результатов.
            // Это модифицирующий запрос
            return res.json({ affectedRows: results.affectedRows });
        } else {
            // Это SELECT запрос
            return res.json({ data: results });
        }
    })
    } catch (error) {
        res.status(500).json({ error: error.message });
        if (connection) {
            connection.end();
        }
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});