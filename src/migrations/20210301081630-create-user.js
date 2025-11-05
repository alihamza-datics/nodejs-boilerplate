'use strict';
module.exports = {
  up: async (queryInterface, { INTEGER, STRING, DATE, DATEONLY, ENUM, BOOLEAN }) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: INTEGER,
        autoIncrement: true,
      },
      firstName: {
        type: STRING,
        allowNull: false,
      },
      lastName: {
        type: STRING,
        allowNull: false,
      },
      email: {
        type: STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: STRING,
        allowNull: false,
      },
      contactNo: {
        type: STRING,
        allowNull: true,
      },
      extension: {
        type: STRING,
        allowNull: true,
      },
      isAdmin: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      role: {
        type: ENUM('admin', 'user'),
      },
      status: {
        type: ENUM('active', 'inactive'),
      },
      avatar: {
        type: STRING,
      },
      dob: {
        type: DATEONLY,
      },
      joiningDate: {
        type: DATEONLY,
      },
      lastActivity: {
        type: DATE,
      },
      loginTime: {
        type: DATE,
      },
      createdAt: {
        allowNull: false,
        type: DATE
      },
      updatedAt: {
        allowNull: false,
        type: DATE
      },
      deletedAt: {
        allowNull: true,
        type: DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
