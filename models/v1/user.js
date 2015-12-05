var Sequelize = require("sequelize");
var sequelize = require('../../config/DAO');

module.exports = sequelize.define("user", {
    user_id: Sequelize.STRING,
    name:Sequelize.STRING,
    mobile: Sequelize.STRING,
    email: Sequelize.STRING,
    gender:Sequelize.INTEGER,
    salt:Sequelize.STRING,
    hash:Sequelize.STRING,
    reg_time:Sequelize.STRING,
    category:Sequelize.STRING
    },
    {
      timestamps:false,
      tableName:"user"
    }
  )