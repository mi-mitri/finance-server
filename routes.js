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

