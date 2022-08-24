const {Sequelize} = require("sequelize");
const dotenv = require('dotenv');
dotenv.config();

const db = new Sequelize({
    dialect: 'sqlite',
    storage: 'db.sqlite'
});

db.sync()

module.exports = {
    db:db
}
