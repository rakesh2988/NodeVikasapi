
const  Sequelize  = require('sequelize');
const sequelize = require('../config/database');

var User = sequelize.define('user', {
    username: Sequelize.STRING,
    birthday: Sequelize.DATE
  });
  module.exports = User;
