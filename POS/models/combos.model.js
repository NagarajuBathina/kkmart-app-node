// const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Combo = sequelize.define(
    "pos_combo",
    {
      combo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      combo_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      combo_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      combo_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      combo_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      combo_gst: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "pos_combo",
      engine: "InnoDB",
    }
  );

  return Combo;
};
