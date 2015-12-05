
var Sequelize = require("sequelize");
var sequelize = new Sequelize('medical', 'medical', 'medical2015', {
      host: "47.88.1.53",
      port: 3306
  });

module.exports = sequelize;