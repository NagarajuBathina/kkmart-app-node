const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const ComboProduct = sequelize.define(
    "pos_combo_product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      barcode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      products_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quantity_in_combo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      available_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      combo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "combos",
          key: "combo_id",
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "product_id",
        },
      },
    },
    {
      timestamps: false,
      tableName: "pos_combo_product",
      engine: "InnoDB",
    }
  );

  return ComboProduct;
};
