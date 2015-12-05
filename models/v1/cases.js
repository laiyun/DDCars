var Sequelize = require("sequelize");
var sequelize = require('../../config/DAO');

module.exports = sequelize.define("case", {
    picture_link: Sequelize.STRING,
    links:Sequelize.STRING,
    content: Sequelize.STRING,
    name:Sequelize.STRING
    },
    {
      timestamps:false,
      tableName:"case"
    }
  )