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

// Create new project
router.post('/projects', (req, res) => {
    const { name, description, companyId } = req.body;
    db.run(`INSERT INTO projects (name, description, company_id) VALUES (?, ?, ?)`, [name, description, companyId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, name, description, companyId });
        }
    });
});

// Update existing project
router.put('/projects/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, companyId } = req.body;
    db.run(`UPDATE projects SET name = ?, description = ?, company_id = ? WHERE id = ?`, [name, description, companyId, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id, name, description, companyId });
        }
    });
});

// Get a single project by ID
router.get('/projects/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM projects WHERE id = ?`, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row);
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

// Обработка транзакций
router.post('/transactions', (req, res) => {
    const { projectId, accountId, date, summ, contractorId, notes } = req.body;
    db.run(`INSERT INTO transactions (project_id, account_id, date, summ, contractor_id, notes) VALUES (?, ?, ?, ?, ?, ?)`, 
        [projectId, accountId, date, summ, contractorId, notes], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            db.run(`UPDATE account SET balance = balance + ? WHERE id = ?`, [summ, accountId], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ id: this.lastID, projectId, accountId, date, summ, contractorId, notes });
                }
            });
        }
    });
});


// Получение всех записей из таблицы "contractors"
router.get('/contractors', (req, res) => {
    db.all('SELECT * FROM contractors', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Получение одной записи из таблицы "contractors"
router.get('/contractors/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM contractors WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
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

// Добавление новой записи в таблицу "contractors"
router.post('/contractors', (req, res) => {
    const { name, email, phone } = req.body;
    db.run('INSERT INTO contractors (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, name, email, phone });
    });
});

// Обновление записи в таблице "contractors"
router.put('/contractors/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    db.run('UPDATE contractors SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id, name, email, phone });
    });
});

// Удаление записи из таблицы "contractors"
router.delete('/contractors/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM contractors WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deletedId: id });
    });
});

// Get a single contractor by ID
router.get('/contractors/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM contractors WHERE id = ?`, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row);
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

// Создание записи в таблице "companies"
router.post('/companies', (req, res) => {
    const { name, accounts } = req.body;
    console.log('Received company data:', req.body); // Логирование данных

    if (!name || !accounts || !Array.isArray(accounts) || accounts.length === 0) {
        console.error('Invalid data format:', req.body);
        return res.status(400).json({ error: 'Invalid data format' });
    }

    db.run(`INSERT INTO companies (name) VALUES (?)`, [name], function(err) {
        if (err) {
            console.error('Error inserting company:', err.message);
            return res.status(500).json({ error: err.message });
        }

        const companyId = this.lastID;
        console.log('Company created with ID:', companyId); // Логирование ID компании

        const accountPromises = accounts.map(account => {
            return new Promise((resolve, reject) => {
                if (!account.bankId || !account.currencyId || !account.accountNumber || !account.balance) {
                    console.error('Incomplete account data:', account);
                    return reject(new Error('Incomplete account data'));
                }

                db.run(`INSERT INTO account (bank_id, currency_id, account_number, balance, company_id) VALUES (?, ?, ?, ?, ?)`, 
                    [account.bankId, account.currencyId, account.accountNumber, account.balance, companyId],
                    function(err) {
                        if (err) {
                            console.error('Error inserting account:', err.message);
                            reject(err);
                        } else {
                            console.log('Account created for company:', companyId, account); // Логирование данных аккаунта
                            resolve();
                        }
                    }
                );
            });
        });

        Promise.all(accountPromises)
            .then(() => res.json({ id: companyId, name, accounts }))
            .catch(err => {
                console.error('Error in accountPromises:', err.message);
                res.status(500).json({ error: err.message });
            });
    });
});

// Обновление записи в таблице "companies"
router.put('/companies/:id', (req, res) => {
    const { id } = req.params;
    const { name, accounts } = req.body;
    db.run(`UPDATE companies SET name = ? WHERE id = ?`, [name, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            db.run(`DELETE FROM account WHERE company_id = ?`, [id], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    const accountPromises = accounts.map(account => {
                        return new Promise((resolve, reject) => {
                            db.run(`INSERT INTO account (bank_id, currency_id, account_number, balance, company_id) VALUES (?, ?, ?, ?, ?)`, 
                                [account.bankId, account.currencyId, account.accountNumber, account.balance, id],
                                function (err) {
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
                        .then(() => res.json({ id, name, accounts }))
                        .catch(err => res.status(500).json({ error: err.message }));
                }
            });
        }
    });
});


// Получение данных компании и связанных счетов
router.get('/companies/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM companies WHERE id = ?`, [id], (err, company) => {
        if (err) {
            console.error('Error fetching company:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        db.all(`SELECT * FROM account WHERE company_id = ?`, [id], (err, accounts) => {
            if (err) {
                console.error('Error fetching accounts:', err.message);
                return res.status(500).json({ error: err.message });
            }

            company.accounts = accounts;
            res.json(company);
        });
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
