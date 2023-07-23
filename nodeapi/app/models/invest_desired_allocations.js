import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class invest_desired_allocations extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    desired_allocations_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(75),
      allowNull: false,
      primaryKey: true
    },
    alloc_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    users_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'invest_desired_allocations',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "desired_allocations_id" },
          { name: "type" },
        ]
      },
      {
        name: "desired_allocations_id_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "desired_allocations_id" },
        ]
      },
      {
        name: "type_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "type" },
        ]
      },
      {
        name: "fk_invest_desired_allocations_users1_idx",
        using: "BTREE",
        fields: [
          { name: "users_user_id" },
        ]
      },
    ]
  });
  }
}
