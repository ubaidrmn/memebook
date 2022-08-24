const { DataTypes } = require('sequelize');
const { db } = require("./config")

const User = db.define('User', {
    Username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    Email:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{});

module.exports = {
    User:User
}
