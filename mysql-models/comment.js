const { DataTypes } = require('sequelize');
const { db } = require("./config");
const { User } = require('./user');

const Comment = db.define('Comment', {
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Comment:{
        type:DataTypes.STRING,
        allowNull:false
    },
    MemeId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
},{});

module.exports = {
    Comment:Comment
}
