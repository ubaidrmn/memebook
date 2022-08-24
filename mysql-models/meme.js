const { DataTypes } = require('sequelize');
const { db } = require("./config");
const { User } = require('./user');

const Meme = db.define('Meme', {
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Link:{
		type:DataTypes.STRING,
		allowNull:false
	},
	Caption:{
		type:DataTypes.STRING,
		allowNull:false
	},
},{});

module.exports = {
    Meme:Meme
}
