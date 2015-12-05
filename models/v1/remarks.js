var Sequelize = require("sequelize");
var sequelize = require('../../config/DAO');

module.exports = sequelize.define("resource", {
    weight: Sequelize.STRING,
    type:Sequelize.STRING,
    content: Sequelize.STRING,
    link: Sequelize.STRING,
    notes:Sequelize.STRING
    },
    {
      timestamps:false,
      tableName:"resource"
    }
  )