const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Убедитесь, что каталог существует
const dbPath = path.resolve(__dirname, 'data', 'db.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database opened successfully');
    }
});

function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS contractors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            account_id INTEGER NOT NULL,
            date DATE NOT NULL,
            summ NUMERIC NOT NULL,
            contractor_id INTEGER,
            notes TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (account_id) REFERENCES account(id),
            FOREIGN KEY (contractor_id) REFERENCES contractors(id)
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS account (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bank_id INTEGER NOT NULL,
            currency_id INTEGER NOT NULL,
            balance NUMERIC NOT NULL,
            company_id INTEGER NOT NULL,
            FOREIGN KEY (bank_id) REFERENCES bank(id),
            FOREIGN KEY (currency_id) REFERENCES currency(id),
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS bank (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS currency (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            short_name TEXT NOT NULL
        )`);
    });
}

module.exports = {
    db,
    initializeDatabase
};
