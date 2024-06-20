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

// Добавление новой компании и связанных счетов
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


router.get('/transactions', (req, res) => {
    db.all(`SELECT * FROM transactions`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

router.get('/contractors', (req, res) => {
    db.all(`SELECT * FROM contractors`, (err, rows) => {
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
