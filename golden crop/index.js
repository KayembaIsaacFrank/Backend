const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./src/routes');
const db = require('./src/models');

const app = express();

app.use(bodyParser.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
});