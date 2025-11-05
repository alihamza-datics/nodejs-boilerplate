import { Model } from 'sequelize';

export default (sequelize, { STRING, INTEGER, ENUM, UUID, UUIDV4 }) => {
  class FileResource extends Model {
    static associate({ User }) {
      this.belongsTo(User, {
        foreignKey: 'createdBy',
      });
      this.belongsTo(User, {
        foreignKey: 'updatedBy',
      });
    }
  }

  FileResource.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: UUID,
        defaultValue: UUIDV4,
      },
      referenceId: {
        type: INTEGER,
        allowNull: true,
      },
      referenceType: {
        type: STRING,
        allowNull: true,
      },
      s3Key: {
        type: STRING,
        allowNull: false,
      },
      createdBy: {
        type: INTEGER,
        allowNull: false,
      },
      updatedBy: {
        type: INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'FileResource',
      timestamps: true,
    }
  );
  return FileResource;
};
