const express = require('express');
const router = express.Router();
const { db } = require('./database');

router.post('/companies', (req, res) => {
    const { name } = req.body;
    const stmt = db.prepare("INSERT INTO companies (name) VALUES (?)");
    stmt.run(name, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});

module.exports = router;
