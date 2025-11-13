const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

const db = {
    User: require('./User')(sequelize, Sequelize.DataTypes),
    Product: require('./Product')(sequelize, Sequelize.DataTypes),
    Sale: require('./Sale')(sequelize, Sequelize.DataTypes),
    SaleDetail: require('./SaleDetail')(sequelize, Sequelize.DataTypes)
};

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;