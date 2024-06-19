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

        // Добавление тестовых данных
        db.run(`INSERT INTO companies (name) VALUES 
            ('Company A'), ('Company B'), ('Company C'), ('Company D'), ('Company E')`, (err) => {
            if (err) {
                console.error('Error inserting into companies:', err.message);
            } else {
                console.log('Inserted data into companies');
            }
        });

        db.run(`INSERT INTO projects (company_id, name) VALUES 
            (1, 'Project A1'), (2, 'Project B1'), (3, 'Project C1'), (4, 'Project D1'), (5, 'Project E1')`, (err) => {
            if (err) {
                console.error('Error inserting into projects:', err.message);
            } else {
                console.log('Inserted data into projects');
            }
        });

        db.run(`INSERT INTO contractors (name) VALUES 
            ('Contractor A'), ('Contractor B'), ('Contractor C'), ('Contractor D'), ('Contractor E')`, (err) => {
            if (err) {
                console.error('Error inserting into contractors:', err.message);
            } else {
                console.log('Inserted data into contractors');
            }
        });

        db.run(`INSERT INTO bank (name) VALUES 
            ('Bank A'), ('Bank B'), ('Bank C'), ('Bank D'), ('Bank E')`, (err) => {
            if (err) {
                console.error('Error inserting into bank:', err.message);
            } else {
                console.log('Inserted data into bank');
            }
        });

        db.run(`INSERT INTO currency (name, short_name) VALUES 
            ('Dollar', 'USD'), ('Euro', 'EUR'), ('Ruble', 'RUB'), ('Pound', 'GBP'), ('Yen', 'JPY')`, (err) => {
            if (err) {
                console.error('Error inserting into currency:', err.message);
            } else {
                console.log('Inserted data into currency');
            }
        });

        db.run(`INSERT INTO account (bank_id, currency_id, balance, company_id) VALUES 
            (1, 1, 1000, 1), (2, 2, 2000, 2), (3, 3, 3000, 3), (4, 4, 4000, 4), (5, 5, 5000, 5)`, (err) => {
            if (err) {
                console.error('Error inserting into account:', err.message);
            } else {
                console.log('Inserted data into account');
            }
        });

        db.run(`INSERT INTO transactions (project_id, account_id, date, summ, contractor_id, notes) VALUES 
            (1, 1, '2023-01-01', 100, 1, 'Payment A1'), 
            (2, 2, '2023-01-02', 200, 2, 'Payment B1'), 
            (3, 3, '2023-01-03', 300, 3, 'Payment C1'), 
            (4, 4, '2023-01-04', 400, 4, 'Payment D1'), 
            (5, 5, '2023-01-05', 500, 5, 'Payment E1')`, (err) => {
            if (err) {
                console.error('Error inserting into transactions:', err.message);
            } else {
                console.log('Inserted data into transactions');
            }
        });
    });
}

module.exports = {
    db,
    initializeDatabase
};
