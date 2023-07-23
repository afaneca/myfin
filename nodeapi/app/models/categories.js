import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class categories extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    category_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    users_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color_gradient: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: "Ativa"
    },
    exclude_from_budgets: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'categories',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "category_id" },
        ]
      },
      {
        name: "uq_name_type_user_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "users_user_id" },
          { name: "type" },
          { name: "name" },
        ]
      },
      {
        name: "fk_category_users_idx",
        using: "BTREE",
        fields: [
          { name: "users_user_id" },
        ]
      },
    ]
  });
  }
}
