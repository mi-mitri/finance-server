const express = require('express');
const router = express.Router();
const { db } = require('./database');

// Маршрут для получения общего баланса и списка компаний
router.get('/total-balance', (req, res) => {
    db.get(`SELECT SUM(balance) as totalBalance FROM account`, (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ totalBalance: row.totalBalance });
        }
    });
});

// Получение всех компаний
router.get('/companies', (req, res) => {
    db.all(`SELECT c.id, c.name, SUM(a.balance) as balance FROM companies c 
            LEFT JOIN account a ON c.id = a.company_id GROUP BY c.id`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Получение всех банков
router.get('/banks', (req, res) => {
    db.all(`SELECT * FROM bank`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Добавление нового банка
router.post('/banks', (req, res) => {
    const { name } = req.body;
    db.run(`INSERT INTO bank (name) VALUES (?)`, [name], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, name });
        }
    });
});

// Редактирование банка
router.put('/banks/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    db.run(`UPDATE bank SET name = ? WHERE id = ?`, [name, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ changes: this.changes });
        }
    });
});

// Удаление банка
router.delete('/banks/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM bank WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ changes: this.changes });
        }
    });
});

// Получение всех валют
router.get('/currencies', (req, res) => {
    db.all(`SELECT * FROM currency`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Получение всех проектов
router.get('/projects', (req, res) => {
    db.all(`SELECT * FROM projects`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Получение всех транзакций
router.get('/transactions', (req, res) => {
    db.all(`SELECT * FROM transactions`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Получение всех подрядчиков
router.get('/contractors', (req, res) => {
    db.all(`SELECT * FROM contractors`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Получение всех счетов
router.get('/account', (req, res) => {
    db.all(`SELECT * FROM account`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Удаление всех записей из базы данных
router.delete('/delete-all', (req, res) => {
    const tables = ['companies', 'projects', 'contractors', 'transactions', 'account', 'bank', 'currency'];
    const deletePromises = tables.map(table => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM ${table}`, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(deletePromises)
        .then(() => res.json({ success: true }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Создание записи в таблице "contractors"
router.post('/contractors', (req, res) => {
    const { name } = req.body;
    db.run(`INSERT INTO contractors (name) VALUES (?)`, [name], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, name });
        }
    });
});

// Создание записи в таблице "currency"
router.post('/currencies', (req, res) => {
    const { name, short_name } = req.body;
    db.run(`INSERT INTO currency (name, short_name) VALUES (?, ?)`, [name, short_name], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, name, short_name });
        }
    });
});

// Создание записи в таблице "transactions"
router.post('/transactions', (req, res) => {
    const { description, amount, companyId, accountId } = req.body;
    db.run(`INSERT INTO transactions (description, amount, company_id, account_id) VALUES (?, ?, ?, ?)`, 
        [description, amount, companyId, accountId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, description, amount, companyId, accountId });
        }
    });
});

// Создание записи в таблице "companies"
router.post('/companies', (req, res) => {
    const { name, accounts } = req.body;
    db.run(`INSERT INTO companies (name) VALUES (?)`, [name], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const companyId = this.lastID;
            const accountPromises = accounts.map(account => {
                return new Promise((resolve, reject) => {
                    db.run(`INSERT INTO account (bank_id, currency_id, account_number, balance, company_id) VALUES (?, ?, ?, ?, ?)`, 
                        [account.bankId, account.currencyId, account.accountNumber, account.balance, companyId],
                        function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        }
                    );
                });
            });
            Promise.all(accountPromises)
                .then(() => res.json({ id: companyId, name, accounts }))
                .catch(err => res.status(500).json({ error: err.message }));
        }
    });
});

// Удаление записи из таблицы
router.delete('/:table/:id', (req, res) => {
    const { table, id } = req.params;
    if (!['companies', 'projects', 'contractors', 'transactions', 'account', 'bank', 'currency'].includes(table)) {
        return res.status(400).json({ error: 'Invalid table name' });
    }
    db.run(`DELETE FROM ${table} WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ changes: this.changes });
        }
    });
});

// Получение баланса всех компаний
router.get('/total-balance', (req, res) => {
    db.all(`SELECT companies.name, SUM(account.balance) as totalBalance FROM companies LEFT JOIN account ON companies.id = account.company_id GROUP BY companies.id`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Получение всех данных из таблицы
router.get('/:table', (req, res) => {
    const { table } = req.params;
    if (!['companies', 'projects', 'contractors', 'transactions', 'account', 'bank', 'currency'].includes(table)) {
        return res.status(400).json({ error: 'Invalid table name' });
    }
    db.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});


router.get('/tables', (req, res) => {
    const tables = ['companies', 'projects', 'contractors', 'transactions', 'account', 'bank', 'currency'];
    res.json(tables.map(name => ({ name })));
});

module.exports = router;
