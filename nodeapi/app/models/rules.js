import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class rules extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    rule_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    matcher_description_operator: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    matcher_description_value: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    matcher_amount_operator: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    matcher_amount_value: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    matcher_type_operator: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    matcher_type_value: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    matcher_account_to_id_operator: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    matcher_account_to_id_value: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    matcher_account_from_id_operator: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    matcher_account_from_id_value: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    assign_category_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    assign_entity_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    assign_account_to_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    assign_account_from_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    assign_type: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    users_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    assign_is_essential: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'rules',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rule_id" },
          { name: "users_user_id" },
        ]
      },
      {
        name: "fk_rules_users1_idx",
        using: "BTREE",
        fields: [
          { name: "users_user_id" },
        ]
      },
    ]
  });
  }
}
