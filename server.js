const express = require('express');
const bodyParser = require('body-parser');
const { initializeDatabase } = require('./database');
const routes = require('./routes');
const app = express();
const port = 3000;

app.use(bodyParser.json());

initializeDatabase();

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
