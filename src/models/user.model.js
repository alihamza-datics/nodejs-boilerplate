import { Model } from 'sequelize';

export default (sequelize, { STRING, INTEGER, ENUM, VIRTUAL, DATEONLY, BOOLEAN, DATE, TEXT }) => {
  class User extends Model {
    static associate({ FileResource }) {
      this.hasMany(FileResource, {
        foreignKey: 'createdBy',
      });
      this.hasMany(FileResource, {
        foreignKey: 'updatedBy',
      });
    }
  }

  User.init(
    {
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
      isAdmin: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      contactNo: {
        type: STRING,
        allowNull: true,
      },
      extension: {
        type: STRING,
        allowNull: true,
      },
      role: {
        type: ENUM('admin', 'user'),
        allowNull: true,
      },
      status: {
        type: ENUM('active', 'inactive'),
      },
      lastActivity: {
        type: DATE,
      },
      avatar: {
        type: STRING,
      },
      joiningDate: {
        type: DATEONLY,
      },
      dob: {
        type: DATEONLY,
      },
      loginTime: {
        allowNull: true,
        type: DATE,
      },
      fullName: {
        type: VIRTUAL,
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
        set() {
          throw new Error('Do not try to set the `fullName` value!');
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      paranoid: true,
      timestamps: true,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
      ],
    }
  );
  return User;
};
