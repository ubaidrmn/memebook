const { DataTypes } = require('sequelize');
const { db } = require("./config")

const Vote = db.define('Vote', {
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Type: { // funny / unfunny
        type:DataTypes.STRING,
        allowNull:false
    },
    MemeId: {
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{});

module.exports = {
    Vote:Vote
}
